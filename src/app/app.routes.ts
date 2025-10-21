import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AddProductComponent } from './components/add-product/add-product.component';
import { HomeComponent } from './components/home/home.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserUpdateComponent } from './components/user-update/user-update.component';
import { ProductUpdateComponent } from './components/product-update/product-update.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProductsComponent } from './components/products/products.component';
import { MyProductsComponent } from './components/my-products/my-products.component';
import { BasketComponent } from './components/basket/basket.component';
import { MyOrdersComponent } from './components/my-orders/my-orders.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';

export const routes: Routes = [
    { path: "", pathMatch: "full", component: HomeComponent },
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
    { path: 'my-basket', component: BasketComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
];
