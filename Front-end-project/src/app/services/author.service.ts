import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Author } from '../shared/models/author.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthorService {
  private apiUrl = `${environment.apiUrl}/api/authors`;

  constructor(private http: HttpClient) {}

  getAuthors(): Observable<Author[]> {
    return this.http.get<Author[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getAuthorById(id: number): Observable<Author> {
    return this.http.get<Author>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createAuthor(author: Author): Observable<Author> {
    return this.http.post<Author>(this.apiUrl, author).pipe(
      catchError(this.handleError)
    );
  }

  updateAuthor(id: number, author: Author): Observable<Author> {
    return this.http.put<Author>(`${this.apiUrl}/${id}`, author).pipe(
      catchError(this.handleError)
    );
  }

  deleteAuthor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  searchAuthors(searchTerm: string): Observable<Author[]> {
    if (!searchTerm.trim()) {
      return of([]);
    }

    searchTerm = searchTerm.toLowerCase();

    return this.getAuthors().pipe(
      map(authors => authors.filter(author => 
        author.name.toLowerCase().includes(searchTerm) ||
        author.email.toLowerCase().includes(searchTerm) ||
        (author.bio && author.bio.toLowerCase().includes(searchTerm)) ||
        (author.specialization && author.specialization.toLowerCase().includes(searchTerm))
      )),
      catchError(this.handleError)
    );
  }

  getAuthorByEmail(email: string): Observable<Author | null> {
    return this.getAuthors().pipe(
      map(authors => authors.find(author => author.email.toLowerCase() === email.toLowerCase()) || null),
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
        errorMessage = 'An author with the same email already exists.';
      } else if (error.status === 404) {
        errorMessage = 'Author not found.';
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
} 