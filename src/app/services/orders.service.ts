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
    this.logger.info('Fetching all orders');
    return this.http.get<Order[]>(`${this.baseUrl}`);
  }

  getOrdersByUserId(userId: number): Observable<Order[]> {
    this.logger.info('Fetching orders by user id', userId);
    return this.http.get<Order[]>(`${this.baseUrl}/user/${userId}`);
  }

  getOrderById(id: number): Observable<Order | null> {
    this.logger.info('Fetching order by id', id);
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  addOrder(order: Order): Observable<Order> {
    this.logger.info('Adding order', order);
    return this.http.post<Order>(this.baseUrl, order);
  }

  updateOrderToShippedById(id: number, order: Order): Observable<Order | null> {
    this.logger.info('Updating order to shipped', id, order);
    return this.http.put<Order>(`${this.baseUrl}/shipped/${id}`, order);
  }

  updateOrderToDeliveredById(id: number, order: Order): Observable<Order | null> {
    this.logger.info('Updating order to delivered', id, order);
    return this.http.put<Order>(`${this.baseUrl}/delivered/${id}`, order);
  }
}
