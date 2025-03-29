import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

export interface Category {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.router.navigate(['/login']);
      throw new Error('No authentication token found');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 401) {
      localStorage.removeItem('auth_token');
      this.router.navigate(['/login']);
      return throwError(() => new Error('Session expired. Please login again.'));
    }
    return throwError(() => error.error?.message || 'An error occurred');
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  updateCategory(id: number, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, category, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }
} 