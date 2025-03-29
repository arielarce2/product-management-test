import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HttpClientModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Product Management';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getUser(): any {
    return this.authService.getUser();
  }

  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
  }
}
