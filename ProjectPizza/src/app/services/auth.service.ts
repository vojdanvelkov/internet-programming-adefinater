import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { FavoritesService } from './favorites.service';
import { CartService } from './cart.service';

export interface User {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USERS_KEY = 'pizza_users';
  private readonly CURRENT_USER_KEY = 'pizza_current_user';
  
  private currentUserSubject = new BehaviorSubject<string | null>(this.loadCurrentUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private router: Router, 
    private favoritesService: FavoritesService,
    private cartService: CartService
  ) {
    // Load favorites and cart for current user on startup
    const currentUser = this.currentUserSubject.value;
    this.favoritesService.loadUserFavorites(currentUser);
    this.cartService.loadUserCart(currentUser);
  }

  private loadCurrentUser(): string | null {
    try {
      return localStorage.getItem(this.CURRENT_USER_KEY);
    } catch {
      return null;
    }
  }

  private getUsers(): User[] {
    try {
      const users = localStorage.getItem(this.USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): string | null {
    return this.currentUserSubject.value;
  }

  signup(username: string, password: string): { success: boolean; error?: string } {
    const users = this.getUsers();
    
    // Check if username already exists
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, error: 'Username already exists' };
    }

    // Validate username (letters and numbers only, 3-20 chars)
    if (!/^[A-Za-z0-9]{3,20}$/.test(username)) {
      return { success: false, error: 'Username must be 3-20 characters (letters and numbers only)' };
    }

    // Validate password (min 4 chars)
    if (password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters' };
    }

    // Add new user
    users.push({ username, password });
    this.saveUsers(users);

    // Auto-login after signup
    this.setCurrentUser(username);

    return { success: true };
  }

  login(username: string, password: string): { success: boolean; error?: string } {
    const users = this.getUsers();
    
    const user = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (!user) {
      return { success: false, error: 'Invalid username or password' };
    }

    this.setCurrentUser(user.username);
    return { success: true };
  }

  private setCurrentUser(username: string): void {
    localStorage.setItem(this.CURRENT_USER_KEY, username);
    this.currentUserSubject.next(username);
    this.favoritesService.loadUserFavorites(username);
    this.cartService.loadUserCart(username);
  }

  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
    this.currentUserSubject.next(null);
    this.favoritesService.clearFavorites();
    this.cartService.clearCart();
    this.router.navigate(['/menu']);
  }

  // Redirect to login if not authenticated, returns true if logged in
  requireAuth(returnUrl?: string): boolean {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/auth'], { 
        queryParams: returnUrl ? { returnUrl } : {} 
      });
      return false;
    }
    return true;
  }
}
