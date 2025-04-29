import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Document } from '../shared/models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/api/documents`;

  constructor(private http: HttpClient) {}

  getDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getDocument(id: number): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createDocument(document: Document): Observable<Document> {
    return this.http.post<Document>(this.apiUrl, document).pipe(
      catchError(this.handleError)
    );
  }

  updateDocument(id: number, document: Document): Observable<Document> {
    return this.http.put<Document>(`${this.apiUrl}/${id}`, document).pipe(
      catchError(this.handleError)
    );
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  searchDocuments(params: {
    query?: string;
    theme?: string;
    author?: string;
    startDate?: string;
    endDate?: string;
    fileType?: string;
  }): Observable<Document[]> {
    let httpParams = new HttpParams();
    
    if (params.query) httpParams = httpParams.set('query', params.query.trim());
    if (params.theme) httpParams = httpParams.set('theme', params.theme.trim());
    if (params.author) httpParams = httpParams.set('author', params.author.trim());
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
    if (params.fileType) httpParams = httpParams.set('fileType', params.fileType.trim());

    return this.http.get<Document[]>(`${this.apiUrl}/search`, { params: httpParams }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.status === 409) {
        errorMessage = 'A document with the same title already exists.';
      } else if (error.status === 404) {
        errorMessage = 'Document not found.';
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
} 