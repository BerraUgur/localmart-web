import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swiper from 'swiper';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { CommentService } from '../../services/comment.service';
import { CustomComment, User } from '../../models/comment';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})

export class ProductDetailComponent implements OnInit, AfterViewInit {
  product: Product | null = null;
  comments?: CustomComment[] = [];
  comment?: string;

  currentUserId?: number;
  seller?: any;

  currentBasket: any = [];

  productMainImgs?: Swiper | any;
  productOtherImgs?: Swiper | any;

  currentRole: string = '';

  private toastr = inject(ToastrService);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private commentService: CommentService,
    private authService: AuthService,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    const productId = +this.route.snapshot.paramMap.get('id')!;
    this.productService.getProductById(productId).subscribe(
      (product: Product | null) => {
        if (product) {
          this.product = product;
          this.comments = product.comments;
          // Fetch seller info for product
          this.authService.getUser(product.sellerUserId).subscribe((user) => {
            this.seller = user;
          });
        } else {
          this.toastr.error('Product not found');
          this.logger.logError('Product not found');
        }
      },
      error => {
        this.toastr.error('Error fetching product details');
        this.logger.logError('Error fetching product details', error);
      }
    );

    this.currentUserId = this.authService.getCurrentUserId();
    this.currentRole = this.authService.getCurrentRoles();
    if (localStorage.getItem('basket')) {
      this.currentBasket = JSON.parse((<any>localStorage.getItem('basket')));
    }
  }


  addBasket(productId: any): void {
    // Prevent adding duplicate products to basket
    if (this.currentBasket.some((item: any) => item.productId === productId)) {
      this.toastr.warning('This product is already in your basket');
      return;
    }
    // Prevent seller from adding own product
    if (this.currentUserId === this.product?.sellerUserId) {
      this.toastr.error('You cannot add your own product to the basket');
      return;
    }
    this.currentBasket.push({ productId, quantity: 1 });
    localStorage.setItem('basket', JSON.stringify(this.currentBasket));
    this.toastr.success('Product has been added to your basket');
  }

  addComment() {
    if (this.product) {
      const newComment: CustomComment = {
        content: this.comment,
        productId: this.product.id,
        userId: this.authService.getCurrentUserId(),
      };
      this.commentService.addComment(newComment).subscribe(
        (data: CustomComment) => {
          // Add new comment to list without reload
          this.comments?.push(data);
          this.toastr.success('Comment added successfully');
        },
        error => {
          this.toastr.error('Error adding comment');
          this.logger.logError('Error adding comment', error);
        }
      );
    }
  }

  deleteComment(commentId: number) {
    this.commentService.deleteComment(commentId).subscribe(
      () => {
        this.comments = this.comments?.filter(comment => comment.id !== commentId);
        this.toastr.success('Comment deleted');
      },
      error => {
        this.toastr.error('Error deleting comment');
        this.logger.logError('Error deleting comment', error);
      }
    );
  }

  deleteProduct(productId: any) {
    this.productService.deleteProduct(productId).subscribe(
      () => {
        this.toastr.success(`${this.product?.name} has been deleted`);
        this.router.navigate(['/products']);
      },
      error => {
        this.toastr.error('Error deleting product');
        this.logger.logError('Error deleting product', error);
      }
    );
  }

  // Capitalize first letter of a string
  capitalizeFirstLetter(value: string | undefined): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  ngAfterViewInit(): void {
    this.initializeSwipers();
  }

  initializeSwipers(): void {
    this.productMainImgs = new Swiper('.product-main-imgs', {
      slidesPerView: 1,
      on: {
        slideChange: () => {
          const activeIndex = this.productMainImgs.activeIndex;
          this.productOtherImgs.slideTo(activeIndex);
          this.updateThumbnailActiveClass(activeIndex);
        }
      }
    });

    this.productOtherImgs = new Swiper('.product-other-imgs', {
      slidesPerView: 2.5,
      spaceBetween: 10,
      breakpoints: {
        668: {
          slidesPerView: 3
        },
        1024: {
          slidesPerView: 4
        }
      }
    });

    // Attach click event listeners
    setTimeout(() => {
      document.querySelectorAll('.product-other-imgs .swiper-slide').forEach((slide, index) => {
        slide.addEventListener('click', () => {
          this.productMainImgs.slideTo(index);
          this.updateThumbnailActiveClass(index);
        });
      });
    }, 100);
  }

  updateThumbnailActiveClass(activeIndex: number): void {
    document.querySelectorAll('.product-other-imgs .swiper-slide').forEach((slide, index) => {
      slide.classList.toggle('active', index === activeIndex);
    });
  }
}
