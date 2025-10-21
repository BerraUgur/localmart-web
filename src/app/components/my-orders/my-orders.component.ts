import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Order } from '../../models/order';
import { OrdersService } from '../../services/orders.service';
import { AuthService } from '../../services/auth.service';
import { AddressService } from '../../services/address.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.css'
})

export class MyOrdersComponent implements OnInit {
  incomingOrders: Order[] = [];
  orders: Order[] = [];
  currentUserId?: number;
  currentUserRole?: string;
  private toastr = inject(ToastrService);

  constructor(
    private ordersService: OrdersService,
    private addressService: AddressService,
    private authService: AuthService,
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.currentUserRole = this.authService.getCurrentRoles();

    // Fetch orders for current user (as buyer)
    this.ordersService.getOrdersByUserId(this.currentUserId).subscribe(data => {
      this.logger.info('Fetched orders for user', this.currentUserId, data);
      data.forEach((item: any) => {
        this.addressService.getAddressById(item.addressId).subscribe(address => {
          item.address = address;
          this.orders = data;
        });
        item.orderItems.forEach((orderItem: any) => {
          this.authService.getUser(orderItem.product.sellerUserId).subscribe(user => {
            orderItem.product.sellerPhone = user.phoneNumber;
          });
        });
      });
    });

    // Fetch orders for current user (as seller)
    this.ordersService.getAllOrders().subscribe(data => {
      this.logger.info('Fetched all orders for seller', this.currentUserId, data);
      data.forEach((item: any) => {
        this.addressService.getAddressById(item.addressId).subscribe(address => {
          item.address = address;
        });
        item.orderItems = item.orderItems.filter((p: any) => p.product.sellerUserId == this.currentUserId);
        item.orderItems.forEach((orderItem: any) => {
          this.authService.getUser(orderItem.product.sellerUserId).subscribe(user => {
            orderItem.product.sellerPhone = user.phoneNumber;
          });
        });
        if (item.orderItems.length > 0) {
          this.incomingOrders.push(item);
        }
      });
    });
  }

  // Update order status to shipped
  orderShipped(order: Order | any) {
    this.ordersService.updateOrderToShippedById(order.id, order).subscribe(() => {
      order.status = 2;
      this.toastr.success('Product has been shipped');
      this.logger.info('Order shipped', order.id);
    });
  }

  // Update order status to delivered
  orderDelivered(order: Order | any) {
    this.ordersService.updateOrderToDeliveredById(order.id, order).subscribe(() => {
      order.status = 3;
      this.toastr.success('Product has been delivered');
      this.logger.info('Order delivered', order.id);
    });
  }
}