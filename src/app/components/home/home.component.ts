import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent implements OnInit {
  products: Product[] = [];
  noProducts: boolean = false;
  private toastr = inject(ToastrService);
  private logger = inject(LoggerService);

  constructor(private productService: ProductService) { }

  ngOnInit() {
    this.productService.getAllProducts().subscribe(
      (data: Product[]) => {
        this.products = data;
      },
      error => {
        this.logger.logError('Error fetching products', error);
        this.toastr.error('An error occurred. Please contact the system administrator. Error Code: ' + error);
      }
    );

    this.productService.getAllProducts().subscribe(
      (data: Product[]) => {
        this.products = data;
      },
      error => {
        this.logger.logError('Error fetching products (second call)', error);
        this.toastr.error('An error occurred. Please contact the system administrator. Error Code: ' + error);
      }
    );
  }
}