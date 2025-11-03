import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { LoggerService } from '../../services/logger.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})

export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  noProducts: boolean = false;
  apiUrl = environment.apiUrl;

  cities: any = []

  private toastr = inject(ToastrService);
  private logger = inject(LoggerService);
  constructor(private productService: ProductService) { }

  ngOnInit() {
    // Fetch all products and extract unique cities
    this.productService.getAllProducts().subscribe(
      (data: Product[]) => {
        this.products = data;
        this.filteredProducts = data;
        data.forEach(product => {
          if (!this.cities.includes(product.city)) {
            this.cities.push(product.city);
          }
        });
      },
      error => {
        this.toastr.error('Error fetching products');
        this.logger.logError('Error fetching products', error);
      }
    );
  }

  updateFilter(e: any) {
    let selectedValue = e.target.value;
    if (selectedValue == 'all') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(p => p.city == selectedValue);
    }
  }
}
