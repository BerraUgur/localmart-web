import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../../services/product';
import { ProductService } from '../../services/product.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, NgFor, NgForOf } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  noProducts: boolean = false;
  private toastr = inject(ToastrService);
  constructor(private productService: ProductService) { }

  ngOnInit() {
    // this.products = [
    //   {
    //     id : 1,
    //     name : 'Ayakkabı',
    //     price : 1500,
    //     discountedPrice : 499.99,
    //     stock : 10,
    //     description : 'Bu bir açıklama yazısıdır',
    //     city : 'İstanbul',
    //     district : 'Kadıköy',
    //     mainImage : '/image.png',
    //     images: ['/image-2.png', '/image-3.png']
    //   }
    // ]

    this.productService.getAllProducts().subscribe(
      (data: Product[]) => {
        this.products = data;
        // this.toastr.success('Başarıyla giriş yapıldı');
      },
      error => {
        this.toastr.error('Hata meydana geldi. Lütfen sistem yöneticisine gösteriniz. Hata Kodu: ' + error)
      }
    );

  }
}
