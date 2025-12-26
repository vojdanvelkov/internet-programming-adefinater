import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/menu', pathMatch: 'full' },
  { 
    path: 'menu', 
    loadComponent: () => import('./features/menu/menu.component').then(m => m.MenuComponent)
  },
  { 
    path: 'builder', 
    loadComponent: () => import('./features/builder/builder.component').then(m => m.BuilderComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'cart', 
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'orders', 
    loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'auth', 
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent)
  },
  { path: '**', redirectTo: '/menu' }
];
