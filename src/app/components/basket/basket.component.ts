import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { AddressService } from '../../services/address.service';
import { User } from '../../models/comment';
import { OrdersService } from '../../services/orders.service';
import { Order, OrderItem } from '../../models/order';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-basket',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './basket.component.html',
  styleUrl: './basket.component.css'
})

export class BasketComponent implements OnInit {
  products: Product[] = [];
  currentBasket: OrderItem | any = [];
  totalPrice: number = 0;
  currentUserId?: number;
  currentUser?: User;
  city: any = '';
  district: any = '';
  postalCode: any = '';
  openAddress: any = '';
  note: any = '';

  private toastr = inject(ToastrService);

  constructor(
    private router: Router,
    private productService: ProductService,
    private addressService: AddressService,
    private ordersService: OrdersService,
    private authService: AuthService,
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    if (localStorage.getItem('basket')) {
      this.currentBasket = JSON.parse((<any>localStorage.getItem('basket')));
    }

    if (this.currentBasket) {
      this.currentBasket.forEach((product: any) => {
        this.productService.getProductById(product.productId).subscribe((product: Product | null) => {
          if (product) {
            this.authService.getUser(product.sellerUserId).subscribe((user) => {
              product.sellerPhone = user.phoneNumber;
              this.products.push(product);
              this.updateTotalPrice()
            })

          } else {
            this.logger.error('Product not found');
          }
        },
          error => {
            this.logger.error('Error fetching product details', error);
          }
        );
      })
    }

    this.currentUserId = this.authService.getCurrentUserId();
    this.authService.getUser(this.currentUserId).subscribe((user) => {
      this.currentUser = user;
      this.logger.debug('Current user:', this.currentUser);
    });
    this.logger.debug('Current basket:', this.currentBasket);
  }

  updateTotalPrice() {
    this.totalPrice = 0;
    this.products.forEach(p => {
      this.logger.debug('Basket product:', p);
      this.totalPrice += p.discountedPrice ?? 0;
    });
    this.logger.info('Total basket price:', this.totalPrice);
  }

  deleteProductBasket(productId: number | any) {
    this.products = this.products.filter((p: any) => p.id != productId)

    let newBasket: any = [];
    this.products.forEach(p => {
      newBasket.push({ productId: p.id, quantity: 1 })
    })

    this.toastr.success('The product has been removed from your basket.');
    this.currentBasket = newBasket
    localStorage.setItem('basket', JSON.stringify(newBasket));
    this.updateTotalPrice()
  }

  //Approves the basket and creates an order. Checks address info, saves address and order.
  approveBasket() {
    if (this.city == '' || this.district == '' || this.postalCode == '' || this.openAddress == '') {
      this.toastr.error('Please fill in the address information.');
      return;
    } else {
      const addressRequest: any = {
        city: this.city,
        userId: this.currentUserId,
        district: this.district,
        postalCode: this.postalCode,
        openAddress: this.openAddress
      };
      this.logger.info('Address request', addressRequest);
      this.addressService.addAddress(addressRequest).subscribe(
        data => {
          let order: Order = {
            userId: this.currentUserId,
            addressId: data.id,
            note: this.note,
            orderItems: this.currentBasket
          }
          this.ordersService.addOrder(order).subscribe(data => {
            this.toastr.success('Your order has been approved.');
            this.logger.info('Order saved:', data);
            this.currentBasket = [];
            localStorage.removeItem('basket');
            this.router.navigate(['/my-orders/']);
          })
        },
        error => {
          this.logger.error('Address save failed', error);
        }
      );
    }
  }
}
