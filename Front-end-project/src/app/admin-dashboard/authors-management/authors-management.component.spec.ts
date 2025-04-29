import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorManagementComponent } from './authors-management.component';

describe('AuthorManagementComponent', () => {
  let component: AuthorManagementComponent;
  let fixture: ComponentFixture<AuthorManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AuthorManagementComponent]
    });
    fixture = TestBed.createComponent(AuthorManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
