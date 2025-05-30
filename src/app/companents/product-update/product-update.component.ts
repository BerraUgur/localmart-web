import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../services/product';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-update',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './product-update.component.html',
  styleUrl: './product-update.component.css'
})
export class ProductUpdateComponent implements OnInit {
  productForm: FormGroup;
  productId?: number;

  imagesArr : string[] = [];

  currentUserId?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private productService: ProductService,
    private authService: AuthService
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      sellerUserId: [''],
      price: [0],
      discountedPrice: [0, Validators.required],
      stock: [null, Validators.required],
      description: ['', Validators.required],
      city: ['', Validators.required],
      district: ['', Validators.required],
      mainImage: [''],
      images: this.fb.array(['', '', '', '', '', '', ''])
    });
  }

  ngOnInit() {
    this.productId = +this.route.snapshot.paramMap.get('id')!;
    this.productService.getProductById(this.productId).subscribe(
      (product: Product | null) => {
        if (product) {
          this.productForm.patchValue(product);
        }
      },
      error => {
        console.error('Error fetching product details', error);
      }
    );

    this.currentUserId = this.authService.getCurrentUserId();

  }

  onMainImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.convertToBase64(file).then(base64 => {
        this.productForm.patchValue({ mainImage: base64 });
      });
    }
  }

  onImagesSelected(event: any) {
    const files = event.target.files;
    const newImages: any = [];
    for (let i = 0; i < files.length; i++) {
      console.log(files[i])
      this.convertToBase64(files[i]).then(base64 => {
        newImages.push(base64);
      });
    }
    setTimeout(() => {
      // this.productForm.patchValue({ images: newImages });
      this.productForm.patchValue({ images: newImages });
      console.log(newImages)
      console.log(this.productForm)
    }, 100);
  }

  convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  updateProduct() {
    if (this.productForm.valid) {
      this.productForm.value.id = this.productId;
      // console.log(this.productForm.value)
      this.productService.updateProduct(this.productId!, this.productForm.value).subscribe(
        response => {
          console.log('Product updated successfully', response);
          this.router.navigate(['/my-products']);
        },
        error => {
          console.error('Error updating product', error);
        }
      );
    }
  }
}