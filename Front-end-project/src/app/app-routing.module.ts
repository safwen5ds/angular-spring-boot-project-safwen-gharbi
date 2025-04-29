import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserHomeComponent } from './user-home/user-home.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from './guards/auth.guard';
import { DocumentManagementComponent } from './admin-dashboard/documents-management/documents-management.component';
import { AuthorManagementComponent } from './admin-dashboard/authors-management/authors-management.component';
import { HomeComponent } from './admin-dashboard/home/home.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule) },
  { path: 'user-home', component: UserHomeComponent, canActivate: [AuthGuard] },
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'documents', component: DocumentManagementComponent },
      { path: 'authors', component: AuthorManagementComponent },
      { 
        path: 'connection-traces', 
        loadChildren: () => import('./admin-dashboard/connection-traces/connection-traces.module').then(m => m.ConnectionTracesModule),
        canActivate: [AuthGuard]
      }
    ]
  },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
