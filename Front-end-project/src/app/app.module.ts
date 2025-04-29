import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SocialAuthServiceConfig, SocialLoginModule, GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { Router } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserHomeComponent } from './user-home/user-home.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthService } from './services/auth.service';
import { HttpConfigInterceptor } from './interceptors/http-config.interceptor';
import { NavbarComponent } from './navbar/navbar.component';
import { NavbarUserComponent } from './navbar-user/navbar-user.component';
import { DocumentManagementComponent } from './admin-dashboard/documents-management/documents-management.component';
import { AuthorManagementComponent } from './admin-dashboard/authors-management/authors-management.component';
import { HomeComponent } from './admin-dashboard/home/home.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { LoggingService } from './services/logging.service';
import { environment } from '../environments/environment';
import { LoginModule } from './login/login.module';
import { ChatbotComponent } from './shared/chatbot/chatbot.component';

export function initializeApp(authService: AuthService, router: Router) {
  return () => {
    return new Promise<void>((resolve) => {
      authService.isAuthenticated$.subscribe(isAuthenticated => {
        if (!isAuthenticated) {
          router.navigate(['/login']);
        }
        resolve();
      });
    });
  };
}

@NgModule({
  declarations: [
    AppComponent,
    UserHomeComponent,
    AdminDashboardComponent,
    NavbarComponent,
    DocumentManagementComponent,
    AuthorManagementComponent,
    ProfileComponent,
    NavbarUserComponent,
    HomeComponent,
    ChatbotComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    SocialLoginModule,
    LoginModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService, Router],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpConfigInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoggingInterceptor,
      multi: true
    },
    LoggingService,
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider('your-google-client-id')
          }
        ]
      } as SocialAuthServiceConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
