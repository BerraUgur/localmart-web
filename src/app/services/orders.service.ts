import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Order } from '../models/order';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  constructor(private readonly http: HttpClient) {}
  private baseUrl: string = `${environment.apiUrl}/orders`;


  getAllOrders(): Observable<Order[]> {
    return this.http.get<any>(this.baseUrl).pipe(
      map(res => res?.data ?? [])
    );
  }

  getOrdersByUserId(userId: number): Observable<Order[]> {
    return this.http.get<any>(`${this.baseUrl}/user/${userId}`).pipe(
      map(res => res?.data ?? [])
    );
  }

  getOrderById(id: number): Observable<Order | null> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  addOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, order);
  }

  updateOrderToShippedById(id: number, order: Order): Observable<Order | null> {
    return this.http.put<Order>(`${this.baseUrl}/shipped/${id}`, order);
  }

  updateOrderToShippedProductById(id: number, order: Order, pid: number | undefined): Observable<Order | null> {
    return this.http.put<Order>(`${this.baseUrl}/shipped-product/${id}?pid=${pid}`, order);
  }

  updateOrderToDeliveredById(id: number, order: Order): Observable<Order | null> {
    return this.http.put<Order>(`${this.baseUrl}/delivered/${id}`, order);
  }

  updateOrderToDeliveredProductById(id: number, order: Order, pid: number | undefined): Observable<Order | null> {
    return this.http.put<Order>(`${this.baseUrl}/delivered-product/${id}?pid=${pid}`, order);
  }
}
