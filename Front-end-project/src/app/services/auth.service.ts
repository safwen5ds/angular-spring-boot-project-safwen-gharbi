import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { environment } from '../../environments/environment';

interface AuthResponse {
  token: string;
  user: {
    email: string;
    name: string;
    photoUrl?: string;
    isAdmin: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticated.asObservable();
  private currentUser = new BehaviorSubject<SocialUser | null>(null);
  currentUser$ = this.currentUser.asObservable();

  constructor(
    private router: Router,
    private http: HttpClient,
    private socialAuthService: SocialAuthService,
    private ngZone: NgZone
  ) {
    const token = localStorage.getItem('token');
    if (token) {
      this.isAuthenticated.next(true);
    }

    this.socialAuthService.authState.subscribe((user: SocialUser) => {
      this.currentUser.next(user);
      if (user) {
        this.handleSocialLogin(user);
      }
    });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/login`, { email, password })
      .pipe(
        tap(response => {
          this.handleAuthResponse(response);
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  handleSocialLogin(user: SocialUser) {
    this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/social-login`, {
      email: user.email,
      name: user.name,
      photoUrl: user.photoUrl,
      provider: user.provider,
      id: user.id
    }).subscribe({
      next: (response) => {
        this.handleAuthResponse(response);
      },
      error: (error) => {
        console.error('Social login error:', error);
      }
    });
  }

  private handleAuthResponse(response: AuthResponse) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('userEmail', response.user.email);
    localStorage.setItem('userName', response.user.name);
    localStorage.setItem('userPhoto', response.user.photoUrl || 'assets/default-avatar.svg');
    localStorage.setItem('isAdmin', response.user.isAdmin.toString());
    localStorage.setItem('isAuthenticated', 'true');
    
    this.isAuthenticated.next(true);
    
    this.ngZone.run(() => {
      if (response.user.isAdmin) {
        this.router.navigate(['/admin-dashboard']);
      } else {
        this.router.navigate(['/user-home']);
      }
    });
  }

  logout() {
    this.isAuthenticated.next(false);
    this.currentUser.next(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhoto');
    localStorage.removeItem('userName');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('isAuthenticated');
    
    this.socialAuthService.signOut();
    
    this.ngZone.run(() => {
      this.router.navigate(['/login']);
    });
  }

  isAdmin(): boolean {
    return localStorage.getItem('isAdmin') === 'true';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/auth/users`);
  }
}
