import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { Product } from '../../services/product';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CommentService } from '../../services/comment.service';
import { CommonModule } from '@angular/common';
import { CustomComment, User } from '../../services/comment';
import { AuthService } from '../../services/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swiper from 'swiper';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule,RouterModule,ReactiveFormsModule,FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit, AfterViewInit {
  product: Product | null = null;
  comments?: CustomComment[] = [];
  comment?: string;

  currentUserId?: number;
  seller?: any;

  currentBasket:any = [];

  productMainImgs?: Swiper | any;
  productOtherImgs?: Swiper | any;

  private toastr = inject(ToastrService);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private commentService: CommentService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const productId = +this.route.snapshot.paramMap.get('id')!;
    this.productService.getProductById(productId).subscribe(
      (product: Product | null) => {
        if (product) {
          this.product = product;
          this.comments = product.comments;
          console.log('Product fetched successfully', product);

          this.authService.getUser(product.sellerUserId).subscribe((user) => {
            this.seller = user
            console.log("this.seller => ", this.seller)
          })
        } else {
          console.error('Product not found');
        }
      },
      error => {
        console.error('Error fetching product details', error);
      }
    );

    this.currentUserId = this.authService.getCurrentUserId();

    if (localStorage.getItem('basket')) {
      this.currentBasket = JSON.parse((<any>localStorage.getItem('basket')));
    }
  }


  addBasket(productId: any): void {
    for (let i = 0; i < this.currentBasket.length; i++) {
      if (this.currentBasket[i].productId === productId) {
        this.toastr.warning(`Ürün Sepetinizde Bulunmaktadır`)
        return;
      }
    }

    if (this.currentUserId == this.product?.sellerUserId) {
      this.toastr.error(`Kendi Ürününüzü Sepete Ekleyemezsiniz`)
      return
    }

    this.currentBasket.push(
      {
        productId: productId,
        quantity: 1
      }
    )
  
    localStorage.setItem('basket', JSON.stringify(this.currentBasket));

    this.toastr.success(`Ürün Sepetinize Eklenmiştir`)
  }  
  
  
  
  addComment() {
    if (this.product) {
      // let currentUser: User | any;
      // this.authService.getUser(this.authService.getCurrentUserId()).subscribe(
      //   (data: User) => {
      //     currentUser = data;
      //   },
      //   error => {
      //     console.error('Cant find user', error);
      //   }
      // );
      // console.log(currentUser)

      const newComment: CustomComment = {
        content: this.comment, productId: this.product.id, userId: this.authService.getCurrentUserId(),
      };
      this.commentService.addComment(newComment).subscribe(
        (data: CustomComment) => {
          location.reload();
          this.comments?.push(data);
          console.log('Comment added successfully', data);
        },
        error => {
          console.error('Error adding comment', error);
        }
      );
    }
  }

  deleteComment(commentId: number) {
    this.commentService.deleteComment(commentId).subscribe(
      () => {
        this.comments = this.comments?.filter(comment => comment.id !== commentId);
      },
      error => {
        console.error('Error deleting comment:', error);
      }
    );
  }

  deleteProduct(productId: any) {
    this.productService.deleteProduct(productId).subscribe(
      () => {
        this.router.navigate(['/products']).then(c=>{
          this.toastr.success(`${this.product?.name} Ürünü Silinmiştir`)
        });
      },
      error => {
        console.error('Error deleting user:', error);
      }
    );
  }

  capitalizeFirstLetter(value: string | undefined): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase();
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
