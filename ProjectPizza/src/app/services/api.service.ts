import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { Pizza, Order, OrderResponse } from '../models/pizza.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:8080';

  // Mock menu data for when API is unavailable
  private readonly mockMenu: Pizza[] = [
    { id: 1, name: 'Margherita', ingredients: ['Tomato sauce', 'Mozzarella', 'Basil'], price: 10, available: true, imageUrl: 'assets/pizzas/margherita.png' },
    { id: 2, name: 'Pepperoni', ingredients: ['Tomato sauce', 'Mozzarella', 'Pepperoni'], price: 12, available: true, imageUrl: 'assets/pizzas/pepperoni.png' },
    { id: 3, name: 'Romana', ingredients: ['Tomato sauce', 'Mozzarella', 'Anchovies', 'Oregano'], price: 15, available: true, imageUrl: 'assets/pizzas/romana.png' },
    { id: 4, name: 'Quattro Formaggi', ingredients: ['Mozzarella', 'Gorgonzola', 'Parmesan', 'Ricotta'], price: 14, available: true, imageUrl: 'assets/pizzas/quattro-formaggi.png' },
    { id: 5, name: 'Vegetariana', ingredients: ['Tomato sauce', 'Mozzarella', 'Peppers', 'Mushrooms', 'Olives'], price: 13, available: true, imageUrl: 'assets/pizzas/vegetariana.png' },
    { id: 6, name: 'Hawaiiana', ingredients: ['Tomato sauce', 'Cheddar', 'Ham', 'Pineapple'], price: 13, available: true, imageUrl: 'assets/pizzas/hawaiiana.png' },
    { id: 7, name: 'Diavola', ingredients: ['Tomato sauce', 'Mozzarella', 'Spicy salami', 'Chili'], price: 14, available: true, imageUrl: 'assets/pizzas/diavola.png' },
    { id: 8, name: 'Capricciosa', ingredients: ['Tomato sauce', 'Mozzarella', 'Ham', 'Mushrooms', 'Artichokes'], price: 15, available: true, imageUrl: 'assets/pizzas/capricciosa.png' },
    { id: 9, name: 'BBQ Chicken', ingredients: ['BBQ sauce', 'Cheddar', 'Grilled chicken', 'Red onion', 'Cilantro'], price: 16, available: true, imageUrl: 'assets/pizzas/bbq-chicken.png' },
    { id: 10, name: 'Prosciutto e Rucola', ingredients: ['Tomato sauce', 'Mozzarella', 'Prosciutto', 'Arugula', 'Parmesan'], price: 17, available: true, imageUrl: 'assets/pizzas/prosciutto-rucola.png' },
    { id: 11, name: 'Meat Lovers', ingredients: ['Tomato sauce', 'Mozzarella', 'Pepperoni', 'Sausage', 'Bacon', 'Ham'], price: 18, available: true, imageUrl: 'assets/pizzas/meat-lovers.png' },
    { id: 12, name: 'Truffle Mushroom', ingredients: ['White sauce', 'Mozzarella', 'Mushrooms', 'Truffle oil', 'Ham'], price: 19, available: true, imageUrl: 'assets/pizzas/truffle-mushroom.png' }
  ];

  constructor(private http: HttpClient) {}

  getMenu(): Observable<Pizza[]> {
    return this.http.get<Pizza[]>(`${this.baseUrl}/api/menu`).pipe(
      catchError(() => {
        console.warn('API unavailable, using mock data');
        return of(this.mockMenu);
      })
    );
  }

  placeOrder(order: Order): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.baseUrl}/api/order`, order);
  }

  getOrder(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/order/${orderId}`);
  }
}
