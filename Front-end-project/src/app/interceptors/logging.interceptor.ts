import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoggingService } from '../services/logging.service';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  constructor(private loggingService: LoggingService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(2, 15);
    
    this.loggingService.debug(`API Request [${requestId}]: ${request.method} ${request.url}`, {
      headers: request.headers.keys().reduce((obj, key) => {
        obj[key] = request.headers.get(key);
        return obj;
      }, {} as any),
      body: request.body
    });

    return next.handle(request).pipe(
      tap({
        next: (event) => {
          const duration = Date.now() - startTime;
          this.loggingService.info(`API Response [${requestId}]: ${request.method} ${request.url} - ${duration}ms`);
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.loggingService.error(`API Error [${requestId}]: ${request.method} ${request.url} - ${duration}ms`, error);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        const duration = Date.now() - startTime;
        this.loggingService.error(`API Error [${requestId}]: ${request.method} ${request.url} - ${duration}ms`, {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        return throwError(() => error);
      })
    );
  }
} 