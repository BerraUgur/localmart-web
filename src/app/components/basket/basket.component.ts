import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { AddressService } from '../../services/address.service';
import { OrdersService } from '../../services/orders.service';
import { AuthService } from '../../services/auth.service';
import { MailService } from '../../services/mail.service';
import { LoggerService } from '../../services/logger.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../models/comment';
import { Order } from '../../models/order';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-basket',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './basket.component.html',
  styleUrl: './basket.component.css'
})
export class BasketComponent implements OnInit {
  products: any = [];
  currentBasket: any = [];
  currentUserId?: number;
  currentUser?: User;
  apiUrl = environment.apiUrl;
  city: any = '';
  district: any = '';
  postalCode: any = '';
  openAddress: any = '';
  note: any = '';

  constructor(
    private productService: ProductService,
    private addressService: AddressService,
    private ordersService: OrdersService,
    private authService: AuthService,
    private mailService: MailService,
    private logger: LoggerService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    if (localStorage.getItem('basket')) {
      this.currentBasket = JSON.parse((<any>localStorage.getItem('basket')));
    }
    if (this.currentBasket) {
      this.currentBasket.forEach((basketItem: any) => {
        this.productService.getProductById(basketItem.productId).subscribe((response: any) => {
          const productData = response?.data;
          if (productData) {
            this.authService.getUser(productData.sellerUserId).subscribe((user: any) => {
              productData.sellerPhone = user.phoneNumber;
              this.products.push(productData);
            });
          } else {
            this.logger.logError('Product not found', { productId: basketItem && 'productId' in basketItem ? basketItem.productId : undefined });
          }
        },
          (error: any) => {
            this.logger.logError('Error fetching product details', error);
          }
        );
      });
      this.currentUserId = this.authService.getCurrentUserId();
      this.authService.getUser(this.currentUserId).subscribe((user: any) => {
        this.currentUser = user;
      });
    }
  }

  get totalPrice() {
    return this.products.reduce((sum: number, product: any) => sum + (product.discountedPrice ?? 0), 0).toFixed(2);
  }

  async deleteProductBasket(productId: number) {
    this.products = this.products.filter((p: any) => p.id != productId);
    let newBasket: any = [];
    this.products.forEach((p: any) => {
      newBasket.push({ productId: p.id, quantity: 1 });
    });
    this.currentBasket = newBasket;
    localStorage.setItem('basket', JSON.stringify(newBasket));
    this.toastr.success('Product removed from your basket.');
  }

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
        openAddress: this.openAddress,
      };
      this.addressService.addAddress(addressRequest).subscribe(
        (response: any) => {
          const addressId = response?.id ?? response?.data?.id;
          if (!addressId || addressId === 0) {
            this.toastr.error('Address creation failed!');
            return;
          }
          let order: Order = {
            userId: this.currentUserId,
            addressId: addressId,
            note: this.note,
            orderItems: this.currentBasket
          };
          this.ordersService.addOrder(order).subscribe((orderData: any) => {
            let products = `
              <table style="width: 100%; border: 1px solid #000; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="padding: 8px; text-align: left;">Product Name</th>
                    <th style="padding: 8px; text-align: left;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.currentBasket.map((basketItem: any) => {
              const product = this.products.find((product: any) => product.id == basketItem.productId);
              return `
                      <tr>
                        <td style="padding: 8px;">${product?.name}</td>
                        <td style="padding: 8px;">${product?.discountedPrice} TL</td>
                      </tr>
                    `;
            }).join('')}
                  <tr>
                    <td colspan="2" style="padding: 8px; text-align: right; font-weight: bold;">Total Price: ${this.totalPrice} TL</td>
                  </tr>
                </tbody>
              </table>
              <br/>
              <b>Address Information:</b><br/>
              <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px;">
                <tr>
                  <td style="padding: 8px; font-weight: bold;">City:</td>
                  <td style="padding: 8px;">${this.city}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">District:</td>
                  <td style="padding: 8px;">${this.district}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Address:</td>
                  <td style="padding: 8px;">${this.openAddress}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Postal Code:</td>
                  <td style="padding: 8px;">${this.postalCode}</td>
                </tr>
              </table>
              <br/>
              <b>Note:</b> ${this.note}<br/><br/>
              You will be informed about the status of your order.<br/><br/>
              Localmart Team
            `;
            this.authService.getUser(this.currentUserId!).subscribe((user: any) => {
              let mail = {
                to: user.email,
                subject: 'Localmart | Your Basket Has Been Approved.',
                body: products
              };
              this.mailService.sendMail(mail).subscribe(
                (response: any) => { this.logger.logInfo('Mail sent successfully', response); },
                (error: any) => { this.logger.logError('Error sending mail', error); }
              );
            });

            // Send an e-mail to the owners of the products in the basket
            const sellerMap = new Map<number, any[]>();
            this.currentBasket.forEach((basketItem: any) => {
              const product = this.products.find((p: any) => p.id == basketItem.productId);
              if (!product) return;
              if (!sellerMap.has(product.sellerUserId)) {
                sellerMap.set(product.sellerUserId, []);
              }
              sellerMap.get(product.sellerUserId)?.push(product);
            });

            sellerMap.forEach((sellerProducts, sellerUserId) => {
              this.authService.getUser(sellerUserId).subscribe((user: any) => {
                let newTotalPrice = sellerProducts.reduce((sum: number, item: any) => sum + Number(item.discountedPrice), 0);
                let productsTable = `
                  <table style="width: 100%; border: 1px solid #000; border-collapse: collapse;">
                    <thead>
                      <tr>
                        <th style="padding: 8px; text-align: left;">Product Name</th>
                        <th style="padding: 8px; text-align: left;">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${sellerProducts.map((item: any) => `
                        <tr>
                          <td style="padding: 8px;">${item.name}</td>
                          <td style="padding: 8px;">${item.discountedPrice} TL</td>
                        </tr>
                      `).join('')}
                      <tr>
                        <td colspan="2" style="padding: 8px; text-align: right; font-weight: bold;">Total Price: ${newTotalPrice.toFixed(2)} TL</td>
                      </tr>
                    </tbody>
                  </table>
                  <br/>
                  <b>Address Information:</b><br/>
                  <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px;">
                    <tr>
                      <td style="padding: 8px; font-weight: bold;">City:</td>
                      <td style="padding: 8px;">${this.city}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; font-weight: bold;">District:</td>
                      <td style="padding: 8px;">${this.district}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; font-weight: bold;">Address:</td>
                      <td style="padding: 8px;">${this.openAddress}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; font-weight: bold;">Postal Code:</td>
                      <td style="padding: 8px;">${this.postalCode}</td>
                    </tr>
                  </table>
                  <br/>
                  Your order has been received successfully. Please ship as soon as possible.<br/><br/>
                  Localmart Team
                `;
                let mail_seller: any = {
                  to: user.email,
                  subject: 'Localmart | Your Order Has Been Approved.',
                  body: productsTable
                };
                this.mailService.sendMail(mail_seller).subscribe();
              });
            });

            this.toastr.success('Your order has been approved.');
            this.currentBasket = [];
            localStorage.removeItem('basket');
            this.router.navigate(['/my-products']);
          });
        },
        (error: any) => {
          this.logger.logError('Address save failed', error);
        }
      );
    }
  }
}
