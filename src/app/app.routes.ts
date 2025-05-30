import { Routes } from '@angular/router';
import { LoginComponent } from './companents/login/login.component';
import { RegisterComponent } from './companents/register/register.component';
import { AddProductComponent } from './companents/add-product/add-product.component';
import { HomeComponent } from './companents/home/home.component';
import { UserListComponent } from './companents/user-list/user-list.component';
import { UserUpdateComponent } from './companents/user-update/user-update.component';
import { ProductUpdateComponent } from './companents/product-update/product-update.component';
import { ProductDetailComponent } from './companents/product-detail/product-detail.component';
import { ProductsComponent } from './companents/products/products.component';
import { MyProductsComponent } from './companents/my-products/my-products.component';
import { BasketComponent } from './companents/basket/basket.component';
import { MyOrdersComponent } from './companents/my-orders/my-orders.component';

export const routes: Routes = [
    { path: "", pathMatch: "full", component: HomeComponent},
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'add-product', component: AddProductComponent },
    { path: 'my-products', component: MyProductsComponent },
    { path: 'my-orders', component: MyOrdersComponent },
    { path: 'user-list', component: UserListComponent },
    { path: 'user-update/:id', component: UserUpdateComponent },
    { path: 'product-update/:id', component: ProductUpdateComponent },
    { path: 'product-detail/:id', component: ProductDetailComponent },
    { path: 'products', component: ProductsComponent },
    { path: 'my-basket', component: BasketComponent},
];
