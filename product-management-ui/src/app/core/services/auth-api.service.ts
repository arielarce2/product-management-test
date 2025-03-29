import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    user: {
      id: number;
      email: string;
      name: string;
    };
    token: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          // Almacenar el token y la información del usuario
          localStorage.setItem('auth_token', response.data.token);
          localStorage.setItem('user_info', JSON.stringify(response.data.user));
        })
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}, { headers: this.getHeaders() }).pipe(
      tap(() => {
        this.clearLocalStorage();
      })
    );
  }

  private clearLocalStorage(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
  }

  getCurrentUser(): any {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}
