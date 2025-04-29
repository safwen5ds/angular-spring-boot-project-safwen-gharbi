import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userEmail: string = '';
  userName: string = '';
  userPhoto: string = '';
  isAdmin: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.userEmail = localStorage.getItem('userEmail') || '';
    this.userName = localStorage.getItem('userName') || this.userEmail.split('@')[0];
    this.userPhoto = localStorage.getItem('userPhoto') || 'assets/default-avatar.svg';
    this.isAdmin = this.authService.isAdmin();
  }
} 