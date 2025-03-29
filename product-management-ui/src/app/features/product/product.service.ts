import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Product {
  id: number;
  name: string;
  category_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  category: {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
  };
}

export interface ProductCreateUpdate {
  name: string;
  category_id: number;
}

export interface ProductResponse {
  current_page: number;
  data: Product[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getProducts(): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(this.apiUrl, { headers: this.getHeaders() });
  }

  createProduct(product: ProductCreateUpdate): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.apiUrl, product, { headers: this.getHeaders() });
  }

  updateProduct(id: number, product: ProductCreateUpdate): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.apiUrl}/${id}`, product, { headers: this.getHeaders() });
  }

  deleteProduct(id: number): Observable<ProductResponse> {
    return this.http.delete<ProductResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getCategories(): Observable<{ id: number; name: string }[]> {
    return this.http.get<{ id: number; name: string }[]>(`${environment.apiUrl}/categories`, { headers: this.getHeaders() });
  }
}
