import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/product/product.module').then(m => m.ProductModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'products',
    loadChildren: () => import('./features/product/product.module').then(m => m.ProductModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'categories',
    loadChildren: () => import('./features/category/category.module').then(m => m.CategoryModule),
    canActivate: [AuthGuard]
  },
  { path: 'login', component: LoginComponent }
];
