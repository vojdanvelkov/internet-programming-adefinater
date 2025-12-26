import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';
import { AuthService } from '../../services/auth.service';
import { Pizza, CartItem } from '../../models/pizza.model';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  pizzas: Pizza[] = [];
  filteredPizzas: Pizza[] = [];
  searchQuery = '';
  priceFilter = 'all';
  sortBy = 'name';
  loading = true;
  showFavoritesOnly = false;
  showFilters = true;
  toast = '';

  constructor(
    private apiService: ApiService,
    private cartService: CartService,
    public favoritesService: FavoritesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMenu();
  }

  loadMenu(): void {
    this.loading = true;
    this.apiService.getMenu().subscribe({
      next: (pizzas) => {
        this.pizzas = pizzas;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showToast('Failed to load menu');
      }
    });
  }

  applyFilters(): void {
    let result = [...this.pizzas];

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.ingredients?.some(i => i.toLowerCase().includes(query))
      );
    }

    // Price filter
    if (this.priceFilter === 'under14') {
      result = result.filter(p => p.price < 14);
    } else if (this.priceFilter === 'under16') {
      result = result.filter(p => p.price >= 14 && p.price < 16);
    } else if (this.priceFilter === 'over16') {
      result = result.filter(p => p.price >= 16);
    }

    // Favorites filter
    if (this.showFavoritesOnly) {
      result = result.filter(p => this.favoritesService.isFavorite(p.id));
    }

    // Sorting
    result.sort((a, b) => {
      if (this.sortBy === 'price-asc') return a.price - b.price;
      if (this.sortBy === 'price-desc') return b.price - a.price;
      if (this.sortBy === 'favorites') {
        const aFav = this.favoritesService.isFavorite(a.id) ? -1 : 1;
        const bFav = this.favoritesService.isFavorite(b.id) ? -1 : 1;
        return aFav - bFav;
      }
      return a.name.localeCompare(b.name);
    });

    this.filteredPizzas = result;
  }

  addToCart(pizza: Pizza): void {
    // Require login before adding to cart
    if (!this.authService.requireAuth('/menu')) {
      return;
    }
    
    const item: CartItem = {
      pizzaId: pizza.id,
      name: pizza.name,
      quantity: 1,
      unitPrice: pizza.price,
      totalPrice: pizza.price
    };
    const result = this.cartService.addItem(item);
    if (result.success) {
      this.showToast(`${pizza.name} added to cart!`);
    } else {
      this.showToast(result.error || 'Could not add to cart');
    }
  }

  toggleFavorite(pizzaId: number): void {
    // Require login before adding to favorites
    if (!this.authService.requireAuth('/menu')) {
      return;
    }
    this.favoritesService.toggle(pizzaId, this.authService.getCurrentUser());
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => this.toast = '', 3000);
  }
}
