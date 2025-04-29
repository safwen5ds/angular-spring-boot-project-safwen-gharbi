import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'projet-angular-safwen-motaz';
  isAuthenticated = false;
  isAdmin = false;
  private authSubscription: Subscription;
  
  constructor(private router: Router, private authService: AuthService) {
    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      isAuth => {
        this.isAuthenticated = isAuth;
        this.isAdmin = this.authService.isAdmin();
      }
    );
  }
  
  ngOnInit() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (!isAuthenticated) {
      this.router.navigate(['/login']);
    } else {
      this.authService.isAuthenticated$.subscribe(isAuth => {
        if (!isAuth) {
          this.router.navigate(['/login']);
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
