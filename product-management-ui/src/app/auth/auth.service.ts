import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

interface LoginResponse {
  status: string;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response?.data?.token) {
            localStorage.setItem(this.TOKEN_KEY, response.data.token);
          }
          if (response?.data?.user) {
            localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      if (user && typeof user === 'object' && 'name' in user) {
        return user as User;
      }
      return null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
}
