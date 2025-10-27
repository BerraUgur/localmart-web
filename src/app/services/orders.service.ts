import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';
import { Order } from '../models/order';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class OrdersService {
  private baseUrl: string = 'http://localhost:5203/orders';
  constructor(private http: HttpClient, private logger: LoggerService) { }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}`);
  }

  getOrdersByUserId(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/user/${userId}`);
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

  updateOrderToDeliveredById(id: number, order: Order): Observable<Order | null> {
    return this.http.put<Order>(`${this.baseUrl}/delivered/${id}`, order);
  }
}
