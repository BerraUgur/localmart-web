import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../../models/product';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-products.component.html',
  styleUrl: './my-products.component.css'
})

export class MyProductsComponent implements OnInit {
  products: Product[] = [];
  noProducts: boolean = false;
  private toastr = inject(ToastrService);
  constructor(private productService: ProductService, private authService: AuthService, private logger: LoggerService) { }

  currentUserId?: number;

  ngOnInit() {
    this.currentUserId = this.authService.getCurrentUserId();

    this.productService.getAllProducts().subscribe(
      (data: any) => {
        const productsArr = Array.isArray(data) ? data : (data.data || []);
        this.products = productsArr.filter((p: Product) => p.sellerUserId === this.currentUserId);
        this.noProducts = this.products.length === 0;
      },
      error => {
        this.toastr.error('Error fetching products', error);
        this.logger.logError('Error fetching products', error);
      }
    );
  }
}
