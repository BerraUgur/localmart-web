import { Component, inject, OnInit } from '@angular/core';
import { Order } from '../../services/order';
import { OrdersService } from '../../services/orders.service';
import { AuthService } from '../../services/auth.service';
import { AddressService } from '../../services/address.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

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
  allOrders:any = []

  currentUserId?: number;
  currentUserRole?: string;
  
  private toastr = inject(ToastrService);
  
  constructor(
    private ordersService: OrdersService,
    private addressService: AddressService,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.currentUserRole = this.authService.getCurrentRoles();
    console.log(this.currentUserRole)

    this.ordersService.getOrdersByUserId(this.currentUserId).subscribe(data => {
      data.forEach((item:any) => {
        let order:any = {}
        this.addressService.getAddressById(item.addressId).subscribe(address => {
          item.address = address
          this.orders = data
          console.log(data)
        })
        item.orderItems.forEach((orderItem:any) => {
          this.authService.getUser(orderItem.product.sellerUserId).subscribe(user => {
            orderItem.product.sellerPhone = user.phoneNumber
          })
        })
      })
    })

    this.ordersService.getAllOrders().subscribe(data =>{
      data.forEach((item:any) => {
        this.addressService.getAddressById(item.addressId).subscribe(address => {
          item.address = address
          console.log(data)
        })
        item.orderItems = item.orderItems.filter((p:any) => p.product.sellerUserId == this.currentUserId)
        item.orderItems.forEach((orderItem:any) => {
          this.authService.getUser(orderItem.product.sellerUserId).subscribe(user => {
            orderItem.product.sellerPhone = user.phoneNumber
          })
        })
        if (item.orderItems.length > 0) {
          this.incomingOrders.push(item)
        }
      })

      this.allOrders = data
      console.log("this.allOrders => ", this.allOrders)
    })
  }


  orderShipped(order:Order | any){
    this.ordersService.updateOrderToShippedById(order.id, order).subscribe(data => {
      order.status = 2
      this.toastr.success(`Ürün Kargoya Verilmiştir`)
    })
  }

  orderDelivered(order:Order | any){
    this.ordersService.updateOrderToDeliveredById(order.id, order).subscribe(data => {
      order.status = 3
      this.toastr.success(`Ürün Teslim Alınmıştır`)
    })
  }
  
  
  
}
