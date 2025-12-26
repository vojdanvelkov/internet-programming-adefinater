import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ApiService } from '../../services/api.service';
import { CartItem } from '../../models/pizza.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  // Order form
  customer = '';
  phone = '';
  address = '';
  priority = false;
  
  // Validation errors
  nameError = '';
  phoneError = '';
  
  // State
  isSubmitting = false;
  orderSuccess = false;
  orderId = '';
  error = '';
  toast = '';

  constructor(
    public cartService: CartService,
    private apiService: ApiService,
    private router: Router
  ) {}

  get items(): CartItem[] {
    return this.cartService.getItems();
  }

  get total(): number {
    return this.cartService.getTotal();
  }

  get priorityFee(): number {
    return this.priority ? this.total * 0.2 : 0;
  }

  get grandTotal(): number {
    return this.total + this.priorityFee;
  }

  // Validate name: only letters and max 1 space between words
  validateName(): void {
    const namePattern = /^[A-Za-z]+(\s[A-Za-z]+)?$/;
    if (!this.customer.trim()) {
      this.nameError = '';
    } else if (!namePattern.test(this.customer.trim())) {
      this.nameError = 'Name must contain only letters with max one space (e.g., Mike Johnson)';
    } else {
      this.nameError = '';
    }
  }

  // Validate phone: must start with + followed by numbers only
  validatePhone(): void {
    const phonePattern = /^\+[0-9]+$/;
    if (!this.phone.trim()) {
      this.phoneError = '';
    } else if (!phonePattern.test(this.phone.trim())) {
      this.phoneError = 'Phone must start with + followed by numbers only (e.g., +38970123456)';
    } else {
      this.phoneError = '';
    }
  }

  // Format name input: remove invalid characters
  onNameInput(): void {
    // Remove consecutive spaces and non-letter characters except single space
    this.customer = this.customer
      .replace(/[^A-Za-z\s]/g, '')
      .replace(/\s{2,}/g, ' ');
    this.validateName();
  }

  // Format phone input: keep only + and numbers
  onPhoneInput(): void {
    // Keep only + at start and numbers
    let cleaned = this.phone.replace(/[^+0-9]/g, '');
    // Ensure + is only at the beginning
    if (cleaned.includes('+')) {
      const plusIndex = cleaned.indexOf('+');
      cleaned = '+' + cleaned.replace(/\+/g, '');
    }
    this.phone = cleaned;
    this.validatePhone();
  }

  updateQuantity(item: CartItem, change: number): void {
    const newQuantity = item.quantity + change;
    if (newQuantity > 0 && item.cartItemId) {
      const result = this.cartService.updateQuantity(item.cartItemId, newQuantity);
      if (!result.success) {
        this.showToast(result.error || 'Could not update quantity');
      }
    }
  }

  removeItem(cartItemId: number | undefined): void {
    if (cartItemId) {
      this.cartService.removeItem(cartItemId);
    }
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => this.toast = '', 3000);
  }

  isFormValid(): boolean {
    const namePattern = /^[A-Za-z]+(\s[A-Za-z]+)?$/;
    const phonePattern = /^\+[0-9]+$/;
    
    return !!(
      this.customer.trim() &&
      namePattern.test(this.customer.trim()) &&
      this.phone.trim() &&
      phonePattern.test(this.phone.trim()) &&
      this.address.trim() &&
      this.items.length > 0 &&
      !this.nameError &&
      !this.phoneError
    );
  }

  submitOrder(): void {
    this.validateName();
    this.validatePhone();
    
    if (!this.isFormValid()) {
      this.error = 'Please fill in all required fields correctly';
      return;
    }

    this.isSubmitting = true;
    this.error = '';

    const order = this.cartService.toOrder(
      this.customer,
      this.phone,
      this.address,
      this.priority
    );

    this.apiService.placeOrder(order).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.orderSuccess = true;
        this.orderId = response.orderId;
        // Save order info for tracking
        this.saveOrderToStorage(response.orderId);
        this.cartService.clear();
      },
      error: (err) => {
        this.isSubmitting = false;
        // For demo, simulate success if API is unavailable
        if (err.status === 0 || err.status === 404) {
          this.orderSuccess = true;
          this.orderId = 'DEMO-' + Math.random().toString(36).substring(2, 8).toUpperCase();
          // Save order info for tracking
          this.saveOrderToStorage(this.orderId);
          this.cartService.clear();
        } else {
          this.error = 'Failed to place order. Please try again.';
        }
      }
    });
  }

  private saveOrderToStorage(orderId: string): void {
    const order = {
      orderId,
      customer: this.customer,
      phone: this.phone,
      address: this.address,
      priority: this.priority,
      cart: this.items,
      orderTime: Date.now(),
      status: 'confirmed'
    };
    const orders = JSON.parse(localStorage.getItem('pizza_orders') || '{}');
    orders[orderId] = order;
    localStorage.setItem('pizza_orders', JSON.stringify(orders));
  }

  trackOrder(): void {
    this.router.navigate(['/orders'], { queryParams: { id: this.orderId } });
  }

  continueShopping(): void {
    this.router.navigate(['/menu']);
  }
}
