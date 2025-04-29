import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

interface User {
  email: string;
  lastLogin: string | null;
}

@Component({
  selector: 'app-connection-traces',
  templateUrl: './connection-traces.component.html',
  styleUrls: ['./connection-traces.component.css']
})
export class ConnectionTracesComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  isLoading = false;
  error: string | null = null;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = null;

    this.authService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error = 'Failed to load connection traces. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  filterUsers(): void {
    if (!this.searchTerm) {
      this.filteredUsers = this.users;
      return;
    }

    this.filteredUsers = this.users.filter(user => 
      user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  formatDate(date: string | null): string {
    if (!date) return 'No Date';
    return new Date(date).toLocaleString();
  }

  retryLoading(): void {
    this.error = null;
    this.loadUsers();
  }
} 