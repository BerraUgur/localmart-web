import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-update',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './product-update.component.html',
  styleUrl: './product-update.component.css'
})

export class ProductUpdateComponent implements OnInit {
  productForm: FormGroup;
  productId?: number;

  mainImage: string = '';
  imagesArr: string[] = [];

  currentUserId?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private productService: ProductService,
    private authService: AuthService,
    private logger: LoggerService,
    private toastr: ToastrService
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
      (response: any) => {
        if (response && response.data) {
          const product = response.data;
          this.mainImage = product.mainImage || '';
          this.imagesArr = product.images || [];
          this.productForm.patchValue({
            ...product,
            mainImage: product.mainImage,
            images: product.images
          });
        }
      },
      error => {
        this.logger.logError('Error fetching product details', error);
      }
    );

    this.currentUserId = this.authService.getCurrentUserId();
  }

  // Handle main image file selection and convert to base64
  onMainImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.convertToBase64(file).then(base64 => {
        this.productForm.patchValue({ mainImage: base64 });
        this.mainImage = base64;
      });
    }
  }

  // Handle multiple image file selection and convert to base64
  onImagesSelected(event: any) {
    const files = event.target.files;
    const newImages: any = [];
    let processed = 0;
    for (let i = 0; i < files.length; i++) {
      this.convertToBase64(files[i]).then(base64 => {
        newImages.push(base64);
        processed++;
        if (processed === files.length) {
          this.productForm.patchValue({ images: newImages });
          this.imagesArr = newImages.filter((img: string) => !!img); // Null/undefined elemanları filtrele
        }
      });
    }
  }

  convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // Update product details
  updateProduct() {
    if (this.productForm.valid) {
      const updateData = {
        id: this.productId,
        name: this.productForm.value.name,
        price: this.productForm.value.price,
        discountedPrice: this.productForm.value.discountedPrice,
        stock: this.productForm.value.stock,
        description: this.productForm.value.description,
        city: this.productForm.value.city,
        district: this.productForm.value.district,
        mainImage: (
          this.productForm.value.mainImage &&
          typeof this.productForm.value.mainImage === 'string' &&
          this.productForm.value.mainImage.startsWith('data:image')
        )
          ? this.productForm.value.mainImage
          : this.mainImage,
        images: Array.isArray(this.productForm.value.images)
          ? this.productForm.value.images.filter((img: string) => img && typeof img === 'string' && img.startsWith('data:image'))
          : [],
        sellerUserId: this.productForm.value.sellerUserId || this.currentUserId,
        sellerPhone: this.productForm.value.sellerPhone || ''
      };
      this.productService.updateProduct(this.productId!, updateData).subscribe(
        () => {
          this.toastr.success('Product updated successfully');
          this.router.navigate(['/my-products']);
        },
        () => {
          this.toastr.error('Error updating product');
        }
      );
    }
  }
}