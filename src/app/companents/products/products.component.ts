import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../../services/product';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  noProducts: boolean = false;
  
  cities:any = []
  
  private toastr = inject(ToastrService);
  constructor(private productService: ProductService) { }

  ngOnInit() {

    this.productService.getAllProducts().subscribe(
      (data: Product[]) => {
        this.products = data;
        this.filteredProducts = data;

        data.forEach(product => {
          if (!this.cities.includes(product.city)) {
            this.cities.push(product.city);
          }
        })
      },
      error => {
        this.toastr.success('Error fetching products', error)
      }
    );
  }


  updateFilter(e:any){
    let selectedValue = e.target.value
    if (selectedValue == 'all') {
      this.filteredProducts = this.products
    }else{
      this.filteredProducts = this.products.filter(p => p.city == selectedValue)
    }
  }
  
  
  
}
