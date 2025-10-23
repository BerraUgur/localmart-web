import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Order } from '../../models/order';
import { OrdersService } from '../../services/orders.service';
import { AuthService } from '../../services/auth.service';
import { AddressService } from '../../services/address.service';
import { LoggerService } from '../../services/logger.service';
import { MailService } from '../../services/mail.service';

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
    private mailService: MailService,
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
      // Send mail to buyer with detailed HTML
      this.authService.getUser(order.userId).subscribe(user => {
        const productsHtml = `
          <table style='width: 100%; border: 1px solid #000; border-collapse: collapse;'>
            <thead>
              <tr>
                <th style='padding: 8px; text-align: left;'>Product Name</th>
                <th style='padding: 8px; text-align: left;'>Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.orderItems.map((item: any) => `
                <tr>
                  <td style='padding: 8px;'>${item.product?.name}</td>
                  <td style='padding: 8px;'>${item.product?.discountedPrice} TL</td>
                </tr>
              `).join('')}
              <tr>
                <td colspan='2' style='padding: 8px; text-align: right; font-weight: bold;'>Total Price: ${order.orderItems.reduce((sum: number, item: any) => sum + (item.product?.discountedPrice ?? 0), 0)} TL</td>
              </tr>
            </tbody>
          </table>
          <br/>
          <b>Address Information:</b><br/>
          <table style='width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px;'>
            <tr>
              <td style='padding: 8px; font-weight: bold;'>City:</td>
              <td style='padding: 8px;'>${order.address?.city}</td>
            </tr>
            <tr>
              <td style='padding: 8px; font-weight: bold;'>District:</td>
              <td style='padding: 8px;'>${order.address?.district}</td>
            </tr>
            <tr>
              <td style='padding: 8px; font-weight: bold;'>Address:</td>
              <td style='padding: 8px;'>${order.address?.openAddress}</td>
            </tr>
            <tr>
              <td style='padding: 8px; font-weight: bold;'>Postal Code:</td>
              <td style='padding: 8px;'>${order.address?.postalCode}</td>
            </tr>
          </table>
          <br/>
          Your order #${order.id} has been shipped. You can track your order from your account.<br/><br/>
          Thank you for shopping with Localmart!<br/><br/>Localmart Team
        `;
        const mail = {
          to: user.email,
          subject: 'Localmart | Your order has been shipped.',
          body: productsHtml
        };
        this.mailService.sendMail(mail).subscribe(
          () => this.logger.info('Mail sent to buyer for shipped order', { orderId: order.id }),
          error => this.logger.error('Error sending mail to buyer for shipped order', error)
        );
      });
    });
  }

  // Update order status to delivered
  orderDelivered(order: Order | any) {
    this.ordersService.updateOrderToDeliveredById(order.id, order).subscribe(() => {
      order.status = 3;
      this.toastr.success('Product has been delivered');
      this.logger.info('Order delivered', order.id);
      // Send mail to seller with detailed HTML
      if (order.orderItems && order.orderItems.length > 0) {
        const sellerId = order.orderItems[0].product.sellerUserId;
        this.authService.getUser(sellerId).subscribe(user => {
          const sellerItems = order.orderItems.filter((item: any) => item.product.sellerUserId === sellerId);
          const newTotalPrice = sellerItems.reduce((sum: number, item: any) => sum + (item.product?.discountedPrice ?? 0), 0);
          const productsHtml = `
            <table style='width: 100%; border: 1px solid #000; border-collapse: collapse;'>
              <thead>
                <tr>
                  <th style='padding: 8px; text-align: left;'>Product Name</th>
                  <th style='padding: 8px; text-align: left;'>Price</th>
                </tr>
              </thead>
              <tbody>
                ${sellerItems.map((item: any) => `
                  <tr>
                    <td style='padding: 8px;'>${item.product?.name}</td>
                    <td style='padding: 8px;'>${item.product?.discountedPrice} TL</td>
                  </tr>
                `).join('')}
                <tr>
                  <td colspan='2' style='padding: 8px; text-align: right; font-weight: bold;'>Total Price: ${newTotalPrice} TL</td>
                </tr>
              </tbody>
            </table>
            <br/>
            <b>Address Information:</b><br/>
            <table style='width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px;'>
              <tr>
                <td style='padding: 8px; font-weight: bold;'>City:</td>
                <td style='padding: 8px;'>${order.address?.city}</td>
              </tr>
              <tr>
                <td style='padding: 8px; font-weight: bold;'>District:</td>
                <td style='padding: 8px;'>${order.address?.district}</td>
              </tr>
              <tr>
                <td style='padding: 8px; font-weight: bold;'>Address:</td>
                <td style='padding: 8px;'>${order.address?.openAddress}</td>
              </tr>
              <tr>
                <td style='padding: 8px; font-weight: bold;'>Postal Code:</td>
                <td style='padding: 8px;'>${order.address?.postalCode}</td>
              </tr>
            </table>
            <br/>
            Your product in order #${order.id} has been delivered to the buyer.<br/><br/>
            Thank you for using Localmart!<br/><br/>Localmart Team
          `;
          const mail = {
            to: user.email,
            subject: 'Localmart | Your product has been delivered.',
            body: productsHtml
          };
          this.mailService.sendMail(mail).subscribe(
            () => this.logger.info('Mail sent to seller for delivered order', { orderId: order.id }),
            error => this.logger.error('Error sending mail to seller for delivered order', error)
          );
        });
      }
    });
  }
}