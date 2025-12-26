import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { CartItem } from '../../models/pizza.model';

interface Topping {
  id: number;
  name: string;
  price: number;
  emoji: string;
}

interface Size {
  label: string;
  value: string;
  priceMultiplier: number;
}

@Component({
  selector: 'app-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './builder.component.html',
  styleUrl: './builder.component.css'
})
export class BuilderComponent {
  availableToppings: Topping[] = [
    { id: 1, name: 'Mozzarella', price: 1.50, emoji: '🧀' },
    { id: 2, name: 'Pepperoni', price: 2.00, emoji: '🍖' },
    { id: 3, name: 'Mushrooms', price: 1.00, emoji: '🍄' },
    { id: 4, name: 'Olives', price: 0.80, emoji: '🫒' },
    { id: 5, name: 'Basil', price: 0.50, emoji: '🌿' },
    { id: 6, name: 'Ham', price: 2.20, emoji: '🥓' },
    { id: 7, name: 'Pineapple', price: 1.00, emoji: '🍍' },
    { id: 8, name: 'Peppers', price: 0.80, emoji: '🫑' },
    { id: 9, name: 'Onions', price: 0.60, emoji: '🧅' },
    { id: 10, name: 'Anchovies', price: 2.50, emoji: '🐟' }
  ];

  sizes: Size[] = [
    { label: 'Small (10")', value: 'S', priceMultiplier: 1 },
    { label: 'Medium (12")', value: 'M', priceMultiplier: 1.3 },
    { label: 'Large (14")', value: 'L', priceMultiplier: 1.6 }
  ];

  selectedToppings: Topping[] = [];
  selectedSize = 'M';
  pizzaName = '';
  basePrice = 6;
  isDragOver = false;
  toast = '';

  constructor(
    private cartService: CartService,
    private authService: AuthService
  ) {}

  onDragStart(event: DragEvent, topping: Topping): void {
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/json', JSON.stringify(topping));
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
    this.isDragOver = true;
  }

  onDragLeave(): void {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    if (event.dataTransfer) {
      try {
        const data = event.dataTransfer.getData('application/json');
        const topping: Topping = JSON.parse(data);
        this.addTopping(topping);
      } catch (e) {
        console.warn('Invalid drop data');
      }
    }
  }

  addTopping(topping: Topping): void {
    // Limit to 6 toppings max
    if (this.selectedToppings.length >= 6) {
      this.showToast('Maximum 6 toppings allowed!');
      return;
    }
    // Allow duplicates for extra toppings
    this.selectedToppings.push({ ...topping });
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => this.toast = '', 3000);
  }

  removeTopping(index: number): void {
    this.selectedToppings.splice(index, 1);
  }

  clearToppings(): void {
    this.selectedToppings = [];
  }

  get currentSize(): Size {
    return this.sizes.find(s => s.value === this.selectedSize) || this.sizes[1];
  }

  get toppingsTotal(): number {
    return this.selectedToppings.reduce((sum, t) => sum + t.price, 0);
  }

  get totalPrice(): number {
    return (this.basePrice + this.toppingsTotal) * this.currentSize.priceMultiplier;
  }

  addToCart(): void {
    // Require login before adding to cart
    if (!this.authService.requireAuth('/builder')) {
      return;
    }
    
    if (this.selectedToppings.length === 0) {
      this.showToast('Please add at least one topping!');
      return;
    }

    const toppingNames = this.selectedToppings.map(t => t.name).join(', ');
    const name = this.pizzaName.trim() || `Custom Pizza (${this.currentSize.label})`;

    const item: CartItem = {
      pizzaId: Date.now(), // unique ID for custom pizzas
      name: `${name} - ${toppingNames}`,
      quantity: 1,
      unitPrice: Math.round(this.totalPrice * 100) / 100,
      totalPrice: Math.round(this.totalPrice * 100) / 100
    };

    const result = this.cartService.addItem(item);
    if (result.success) {
      this.showToast('Custom pizza added to cart!');
      // Reset builder
      this.selectedToppings = [];
      this.pizzaName = '';
    } else {
      this.showToast(result.error || 'Could not add to cart');
    }
  }
}
