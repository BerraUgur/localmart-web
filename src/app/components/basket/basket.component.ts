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
import { MailService } from '../../services/mail.service';

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
    private mailService: MailService,
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
          this.ordersService.addOrder(order).subscribe(orderData => {
            // Prepare mail for user
            let productsHtml = `
              <table style='width: 100%; border: 1px solid #000; border-collapse: collapse;'>
                <thead>
                  <tr>
                    <th style='padding: 8px; text-align: left;'>Product Name</th>
                    <th style='padding: 8px; text-align: left;'>Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.currentBasket.map((basketItem: any) => {
                    const product = this.products.find((product: any) => product.id == basketItem.productId);
                    return `
                      <tr>
                        <td style='padding: 8px;'>${product?.name}</td>
                        <td style='padding: 8px;'>${product?.discountedPrice} TL</td>
                      </tr>
                    `;
                  }).join('')}
                  <tr>
                    <td colspan='2' style='padding: 8px; text-align: right; font-weight: bold;'>Total Price: ${this.totalPrice} TL</td>
                  </tr>
                </tbody>
              </table>
              <br/>
              <b>Address Information:</b><br/>
              <table style='width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px;'>
                <tr>
                  <td style='padding: 8px; font-weight: bold;'>City:</td>
                  <td style='padding: 8px;'>${this.city}</td>
                </tr>
                <tr>
                  <td style='padding: 8px; font-weight: bold;'>District:</td>
                  <td style='padding: 8px;'>${this.district}</td>
                </tr>
                <tr>
                  <td style='padding: 8px; font-weight: bold;'>Address:</td>
                  <td style='padding: 8px;'>${this.openAddress}</td>
                </tr>
                <tr>
                  <td style='padding: 8px; font-weight: bold;'>Postal Code:</td>
                  <td style='padding: 8px;'>${this.postalCode}</td>
                </tr>
              </table>
              <br/>
              <b>Note:</b> ${this.note}<br/><br/>
              You will be informed about the status of your order.<br/><br/>
              Localmart Team
            `;
            this.authService.getUser(this.currentUserId!).subscribe((user) => {
              let mail = {
                to: user.email,
                subject: 'Localmart | Your Basket Has Been Approved.',
                body: productsHtml
              };
              this.mailService.sendMail(mail).subscribe(
                (response: any) => { this.logger.info('Mail sent successfully', response); },
                (error: any) => { this.logger.error('Error sending mail', error); }
              );
            });

            // Send mail to each seller for their products
            let sellerIds = Array.from(new Set(this.products.map((p: any) => p.sellerUserId)));
            sellerIds.forEach((sellerId: number) => {
              this.authService.getUser(sellerId).subscribe((seller) => {
                let sellerProducts = this.products.filter((p: any) => p.sellerUserId == sellerId);
                let sellerBasketItems = this.currentBasket.filter((item: any) => {
                  return sellerProducts.some((p: any) => p.id == item.productId);
                });
                let newTotalPrice = sellerBasketItems.reduce((sum: number, item: any) => {
                  const product = sellerProducts.find((p: any) => p.id == item.productId);
                  return sum + (product?.discountedPrice ?? 0);
                }, 0);
                let sellerProductsHtml = `
                  <table style='width: 100%; border: 1px solid #000; border-collapse: collapse;'>
                    <thead>
                      <tr>
                        <th style='padding: 8px; text-align: left;'>Product Name</th>
                        <th style='padding: 8px; text-align: left;'>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${sellerBasketItems.map((basketItem: any) => {
                        const product = sellerProducts.find((p: any) => p.id == basketItem.productId);
                        return `
                          <tr>
                            <td style='padding: 8px;'>${product?.name}</td>
                            <td style='padding: 8px;'>${product?.discountedPrice} TL</td>
                          </tr>
                        `;
                      }).join('')}
                      <tr>
                        <td colspan='2' style='padding: 8px; text-align: right; font-weight: bold;'>Total Price: ${newTotalPrice.toFixed(2)} TL</td>
                      </tr>
                    </tbody>
                  </table>
                  <br/>
                  <b>Address Information:</b><br/>
                  <table style='width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px;'>
                    <tr>
                      <td style='padding: 8px; font-weight: bold;'>City:</td>
                      <td style='padding: 8px;'>${this.city}</td>
                    </tr>
                    <tr>
                      <td style='padding: 8px; font-weight: bold;'>District:</td>
                      <td style='padding: 8px;'>${this.district}</td>
                    </tr>
                    <tr>
                      <td style='padding: 8px; font-weight: bold;'>Address:</td>
                      <td style='padding: 8px;'>${this.openAddress}</td>
                    </tr>
                    <tr>
                      <td style='padding: 8px; font-weight: bold;'>Postal Code:</td>
                      <td style='padding: 8px;'>${this.postalCode}</td>
                    </tr>
                  </table>
                  <br/>
                  Your order has been received successfully. Please ship as soon as possible.<br/><br/>
                  Localmart Team
                `;
                let mailSeller = {
                  to: seller.email,
                  subject: 'Localmart | Your Order Has Been Approved.',
                  body: sellerProductsHtml
                };
                this.mailService.sendMail(mailSeller).subscribe();
              });
            });

            this.toastr.success('Your order has been approved.');
            this.logger.info('Order saved:', orderData);
            this.currentBasket = [];
            localStorage.removeItem('basket');
            this.router.navigate(['/my-orders/']);
          });
        },
        error => {
          this.logger.error('Address save failed', error);
        }
      );
    }
  }
}
