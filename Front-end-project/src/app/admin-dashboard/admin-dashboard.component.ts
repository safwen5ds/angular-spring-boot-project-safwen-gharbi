import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="container-fluid mt-4">
      <router-outlet></router-outlet>
    </div>
  `
})
export class AdminDashboardComponent {}
