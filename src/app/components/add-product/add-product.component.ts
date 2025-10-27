import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})

export class AddProductComponent {
  mainImage: string | null = null;
  images: string[] = [];
  name: string = '';
  price: number | null = null;
  discountedPrice: number | null = null;
  stock: number | null = null;
  description: string = '';
  city: string = '';
  district: string = '';

  singleImageBase64: string | undefined;
  multipleImagesBase64: string[] = [];

  ngOnInit() {
  }

  constructor(private productService: ProductService, private router: Router, private logger: LoggerService) { }

  onSingleFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Only allow image files for security
      if (!file.type.startsWith('image/')) {
        this.logger.logError('Only image files are allowed.');
        return;
      }
      this.convertToBase64(file).then(
        (base64: string) => {
          this.singleImageBase64 = base64;
        }
      );
    }
  }

  onMultipleFilesSelected(event: any): void {
    const files = event.target.files;
    if (files.length > 0) {
      this.multipleImagesBase64 = []; // Reset previous images
      Array.from(files).forEach((file: any) => {
        // Only allow image files for security
        if (!file.type.startsWith('image/')) {
          this.logger.logError('Only image files are allowed.');
          return;
        }
        this.convertToBase64(file).then(
          (base64: string) => {
            this.multipleImagesBase64.push(base64);
          }
        );
      });
    }
  }

  /**
   * Converts a file to base64 string. Used for image upload.
   */
  private convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  saveProduct() {
    const productRequest: any = {
      mainImage: this.singleImageBase64,
      images: this.multipleImagesBase64,
      name: this.name,
      price: this.price,
      discountedPrice: this.discountedPrice,
      stock: this.stock,
      description: this.description,
      city: this.city,
      district: this.district
    };
    this.productService.createProduct(productRequest).subscribe(
      data => {
        this.router.navigate(['']);
      },
      error => {
        this.logger.logError('Product save failed', error);
      }
    );
  }
}