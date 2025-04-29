// src/app/shared/shared.module.ts
import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterModule }   from '@angular/router';
import { FormsModule }    from '@angular/forms';

// shared components
import { NavbarComponent }     from '../navbar/navbar.component';
import { NavbarUserComponent } from '../navbar-user/navbar-user.component';

@NgModule({
  declarations: [
    NavbarComponent,
    NavbarUserComponent
  ],
  imports: [
    CommonModule,
    RouterModule,   
    FormsModule     
  ],
  exports: [

    CommonModule,
    RouterModule,
    FormsModule,


    NavbarComponent,
    NavbarUserComponent
  ]
})
export class SharedModule { }
