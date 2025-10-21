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

    this.productService.getAllProducts().subscribe(
      (data: Product[]) => {
        this.products = data.filter(p => p.sellerUserId === this.currentUserId);
        this.logger.info('Products fetched successfully', data);
        this.logger.debug('Filtered products:', this.products);
      },
      error => {
        this.toastr.success('Error fetching products', error);
        this.logger.error('Error fetching products', error);
      }
    );

    this.currentUserId = this.authService.getCurrentUserId();
    this.logger.debug('Current user id:', this.currentUserId);
  }
}
