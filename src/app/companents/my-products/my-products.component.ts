import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../../services/product';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-products',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './my-products.component.html',
  styleUrl: './my-products.component.css'
})
export class MyProductsComponent implements OnInit {
  products: Product[] = [];
  noProducts: boolean = false;
  private toastr = inject(ToastrService);
  constructor(private productService: ProductService, private authService: AuthService) { }

  currentUserId?: number;

  ngOnInit() {

    this.productService.getAllProducts().subscribe(
      (data: Product[]) => {
        this.products = data.filter(p => p.sellerUserId === this.currentUserId);
        console.log('Products fetched successfully', data);

          
        console.log("this.filteredProducts => ", this.products)
      },
      error => {
        this.toastr.success('Error fetching products', error)
      }
    );

    this.currentUserId = this.authService.getCurrentUserId();

    console.log(this.currentUserId)

    
  }
}
