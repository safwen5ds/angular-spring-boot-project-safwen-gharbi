import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private apiUrl = `${environment.apiUrl}/api/logs`;

  constructor(private http: HttpClient) {}

  log(message: string, level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR' = 'INFO', data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      source: 'frontend',
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    switch (level) {
      case 'INFO':
        console.info(`[${timestamp}] ${message}`, data);
        break;
      case 'DEBUG':
        console.debug(`[${timestamp}] ${message}`, data);
        break;
      case 'WARN':
        console.warn(`[${timestamp}] ${message}`, data);
        break;
      case 'ERROR':
        console.error(`[${timestamp}] ${message}`, data);
        break;
    }

    if (environment.production) {
      this.http.post(this.apiUrl, logEntry).subscribe(
        () => {},
        error => console.error('Failed to send log to backend', error)
      );
    }
  }

  info(message: string, data?: any) {
    this.log(message, 'INFO', data);
  }

  debug(message: string, data?: any) {
    this.log(message, 'DEBUG', data);
  }

  warn(message: string, data?: any) {
    this.log(message, 'WARN', data);
  }

  error(message: string, data?: any) {
    this.log(message, 'ERROR', data);
  }
} 