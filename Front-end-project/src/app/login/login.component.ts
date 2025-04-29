import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { Subscription } from 'rxjs';

declare global {
  interface Window {
    handleCredentialResponse: (response: any) => void;
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, config: any) => void;
          prompt: () => void;
        }
      }
    }
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  private authSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private socialAuthService: SocialAuthService,
    private ngZone: NgZone
  ) {
    this.authSubscription = this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.ngZone.run(() => {
          if (this.authService.isAdmin()) {
            this.router.navigate(['/admin-dashboard']);
          } else {
            this.router.navigate(['/user-home']);
          }
        });
      }
    });

    this.socialAuthService.authState.subscribe((user: SocialUser) => {
      if (user) {
        this.authService.handleSocialLogin(user);
      }
    });
  }

  ngOnInit() {
    window.handleCredentialResponse = (response: any) => {
      console.log("Google Sign-In Response:", response);
      if (response.credential) {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        const user: Partial<SocialUser> = {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          photoUrl: payload.picture,
          firstName: payload.given_name,
          lastName: payload.family_name,
          authToken: response.credential,
          provider: 'GOOGLE',
          idToken: response.credential,
          response: payload
        };
        this.authService.handleSocialLogin(user as SocialUser);
      }
    };

    this.initializeGoogleSignIn();
  }

  private initializeGoogleSignIn() {
    const checkGoogleScript = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(checkGoogleScript);
        
        window.google.accounts.id.initialize({
          client_id: '530087701423-rmgmf4tjhpm8aapos2217o4jmv91722l.apps.googleusercontent.com',
          callback: window.handleCredentialResponse,
          auto_select: true,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false,
          prompt_parent_id: 'g_id_onload'
        });

        const buttonContainer = document.querySelector('.g_id_signin') as HTMLElement;
        if (buttonContainer) {
          window.google.accounts.id.renderButton(buttonContainer, {
            type: 'standard',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 300,
            locale: 'en'
          });
        }
      }
    }, 100);
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  login() {
    this.errorMessage = '';
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login successful');
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = 'Invalid email or password';
      }
    });
  }
}
