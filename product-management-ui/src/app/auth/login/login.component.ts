import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  template: `
    <div class="container">
      <div class="row justify-content-center mt-5">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h3 class="text-center">Login</h3>
            </div>
            <div class="card-body">
              <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    [(ngModel)]="email"
                    name="email"
                    required
                    [class.is-invalid]="email && !isValidEmail(email)"
                  >
                  <div class="invalid-feedback" *ngIf="email && !isValidEmail(email)">
                    Please enter a valid email address
                  </div>
                </div>
                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                    [(ngModel)]="password"
                    name="password"
                    required
                    minlength="6"
                    [class.is-invalid]="password && password.length < 6"
                  >
                  <div class="invalid-feedback" *ngIf="password && password.length < 6">
                    Password must be at least 6 characters long
                  </div>
                </div>
                <div class="alert alert-danger" *ngIf="error">
                  {{ error }}
                </div>
                <button 
                  type="submit" 
                  class="btn btn-primary w-100"
                  [disabled]="!isValidForm() || isLoading"
                >
                  <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ isLoading ? 'Logging in...' : 'Login' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidForm(): boolean {
    return this.isValidEmail(this.email) && this.password.length >= 6;
  }

  onSubmit(): void {
    if (!this.isValidForm()) {
      return;
    }

    this.error = '';
    this.isLoading = true;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        if (response.status === 'success' && response.data?.token) {
          this.router.navigate(['/products']);
        } else {
          this.error = 'Unexpected error during login';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Login error:', err);
        this.isLoading = false;
        if (err.status === 401) {
          this.error = 'Invalid email or password';
        } else if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'An error occurred during login';
        }
      }
    });
  }
}
