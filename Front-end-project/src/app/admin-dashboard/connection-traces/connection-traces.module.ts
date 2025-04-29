import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConnectionTracesComponent } from './connection-traces.component';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';

@NgModule({
  declarations: [
    ConnectionTracesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      { 
        path: '', 
        component: ConnectionTracesComponent,
        canActivate: [AuthGuard]
      }
    ])
  ]
})
export class ConnectionTracesModule { } 