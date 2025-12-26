import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem, Order } from '../models/pizza.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly STORAGE_KEY_PREFIX = 'pizza_cart_';
  private currentUser: string | null = null;
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  
  cart$ = this.cartSubject.asObservable();

  private getStorageKey(): string {
    return this.currentUser 
      ? `${this.STORAGE_KEY_PREFIX}${this.currentUser}` 
      : `${this.STORAGE_KEY_PREFIX}guest`;
  }

  private loadFromStorage(): CartItem[] {
    try {
      const saved = localStorage.getItem(this.getStorageKey());
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(items: CartItem[]): void {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(items));
  }

  // Called when user logs in
  loadUserCart(username: string | null): void {
    this.currentUser = username;
    const items = this.loadFromStorage();
    this.cartSubject.next(items);
  }

  // Called when user logs out
  clearCart(): void {
    this.currentUser = null;
    this.cartSubject.next([]);
  }

  readonly MAX_TOTAL_PIZZAS = 10;
  readonly MAX_SAME_TYPE = 6;

  getItems(): CartItem[] {
    return this.cartSubject.value;
  }

  getTotalQuantity(): number {
    return this.cartSubject.value.reduce((sum, item) => sum + item.quantity, 0);
  }

  addItem(item: CartItem): { success: boolean; error?: string } {
    const items = [...this.cartSubject.value];
    const currentTotal = this.getTotalQuantity();
    
    // Check max total pizzas limit
    if (currentTotal + item.quantity > this.MAX_TOTAL_PIZZAS) {
      const canAdd = this.MAX_TOTAL_PIZZAS - currentTotal;
      if (canAdd <= 0) {
        return { success: false, error: `Cart is full! Maximum ${this.MAX_TOTAL_PIZZAS} pizzas allowed.` };
      }
      return { success: false, error: `Can only add ${canAdd} more pizza(s). Maximum ${this.MAX_TOTAL_PIZZAS} pizzas allowed.` };
    }

    // Find existing item with same pizza ID and name to combine quantities
    const existingIndex = items.findIndex(i => i.pizzaId === item.pizzaId && i.name === item.name);
    
    if (existingIndex >= 0) {
      // Check max same type limit
      const newQuantity = items[existingIndex].quantity + item.quantity;
      if (newQuantity > this.MAX_SAME_TYPE) {
        const canAdd = this.MAX_SAME_TYPE - items[existingIndex].quantity;
        if (canAdd <= 0) {
          return { success: false, error: `Already have ${this.MAX_SAME_TYPE} of this pizza. Maximum ${this.MAX_SAME_TYPE} of same type allowed.` };
        }
        return { success: false, error: `Can only add ${canAdd} more of this pizza. Maximum ${this.MAX_SAME_TYPE} of same type allowed.` };
      }
      // Combine quantities for same pizza
      items[existingIndex].quantity = newQuantity;
      items[existingIndex].totalPrice = items[existingIndex].quantity * items[existingIndex].unitPrice;
    } else {
      // Check max same type for new item
      if (item.quantity > this.MAX_SAME_TYPE) {
        return { success: false, error: `Maximum ${this.MAX_SAME_TYPE} of same pizza type allowed.` };
      }
      // New pizza - add with unique cart ID
      const cartItemId = item.cartItemId || Date.now() + Math.random();
      items.push({ ...item, cartItemId });
    }
    
    this.cartSubject.next(items);
    this.saveToStorage(items);
    return { success: true };
  }

  updateQuantity(cartItemId: number, quantity: number): { success: boolean; error?: string } {
    const item = this.cartSubject.value.find(i => i.cartItemId === cartItemId);
    if (!item) return { success: false, error: 'Item not found' };

    // Check max same type limit
    if (quantity > this.MAX_SAME_TYPE) {
      return { success: false, error: `Maximum ${this.MAX_SAME_TYPE} of same pizza type allowed.` };
    }

    // Check max total pizzas limit
    const otherItemsTotal = this.cartSubject.value
      .filter(i => i.cartItemId !== cartItemId)
      .reduce((sum, i) => sum + i.quantity, 0);
    
    if (otherItemsTotal + quantity > this.MAX_TOTAL_PIZZAS) {
      return { success: false, error: `Maximum ${this.MAX_TOTAL_PIZZAS} pizzas allowed in cart.` };
    }

    const items = this.cartSubject.value.map(item => {
      if (item.cartItemId === cartItemId) {
        return { ...item, quantity, totalPrice: quantity * item.unitPrice };
      }
      return item;
    }).filter(item => item.quantity > 0);
    
    this.cartSubject.next(items);
    this.saveToStorage(items);
    return { success: true };
  }

  removeItem(cartItemId: number): void {
    const items = this.cartSubject.value.filter(item => item.cartItemId !== cartItemId);
    this.cartSubject.next(items);
    this.saveToStorage(items);
  }

  clear(): void {
    this.cartSubject.next([]);
    localStorage.removeItem(this.getStorageKey());
  }

  getTotal(): number {
    return this.cartSubject.value.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  toOrder(customer: string, phone: string, address: string, priority: boolean): Order {
    return {
      customer,
      phone,
      address,
      priority,
      cart: this.cartSubject.value,
      position: '0,0'
    };
  }
}
