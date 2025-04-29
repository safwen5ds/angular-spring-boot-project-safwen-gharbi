import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NgZone } from '@angular/core';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private ngZone: NgZone
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0) {
          console.error('Connection refused. Is the backend server running?');
        }
        
        if (error.status === 403 && error.error?.message?.includes('CORS')) {
          console.error('CORS error. Check your backend CORS configuration.');
        }
        
        if (error.status === 401) {
          this.ngZone.run(() => {
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
          });
        }
        
        return throwError(() => error);
      })
    );
  }
} 