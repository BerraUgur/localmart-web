import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Order } from './order';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private baseUrl: string = 'http://localhost:5203/orders';

  constructor(private http: HttpClient) {}

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}`);
  }
  getOrdersByUserId(productId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/user/${productId}`);
  }

  getOrderById(id: number): Observable<Order | null> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  addOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, order);
  }

  updateOrderToShippedById(id: number, order:Order ): Observable<Order | null> {
    console.log('id => ', id)
    return this.http.put<Order>(`${this.baseUrl}/shipped/${id}`, order);
  }

  updateOrderToDeliveredById(id: number, order: Order): Observable<Order | null> {
    return this.http.put<Order>(`${this.baseUrl}/delivered/${id}`, order);
  }
}
