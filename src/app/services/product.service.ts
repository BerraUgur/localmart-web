import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product, ProductRequest } from '../models/product';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class ProductService {
  private baseUrl: string = 'http://localhost:5203/products';
  constructor(private http: HttpClient) { }

  getAllProducts(): Observable<Product[]> {
    return this.http.get<any>(this.baseUrl).pipe(
      map((res: any) => res?.data ?? [])
    );
  }

  getProductById(id: number): Observable<Product | null> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  createProduct(product: ProductRequest): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, product);
  }

  updateProduct(id: number, product: Product): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
