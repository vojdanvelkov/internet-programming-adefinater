import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly STORAGE_KEY = 'pizza_favorites';
  private favoritesSubject = new BehaviorSubject<Set<number>>(new Set());
  
  favorites$ = this.favoritesSubject.asObservable();

  constructor() {
    // Listen for auth changes - favorites are loaded per user
  }

  private getStorageKey(username: string | null): string {
    return username ? `${this.STORAGE_KEY}_${username}` : this.STORAGE_KEY;
  }

  loadUserFavorites(username: string | null): void {
    if (!username) {
      // Clear favorites when logged out
      this.favoritesSubject.next(new Set());
      return;
    }
    
    try {
      const key = this.getStorageKey(username);
      const saved = localStorage.getItem(key);
      this.favoritesSubject.next(saved ? new Set(JSON.parse(saved)) : new Set());
    } catch {
      this.favoritesSubject.next(new Set());
    }
  }

  clearFavorites(): void {
    this.favoritesSubject.next(new Set());
  }

  private saveToStorage(favorites: Set<number>, username: string | null): void {
    if (!username) return;
    const key = this.getStorageKey(username);
    localStorage.setItem(key, JSON.stringify([...favorites]));
  }

  isFavorite(pizzaId: number): boolean {
    return this.favoritesSubject.value.has(pizzaId);
  }

  toggle(pizzaId: number, username: string | null): void {
    if (!username) return; // Don't save if not logged in
    
    const favorites = new Set(this.favoritesSubject.value);
    if (favorites.has(pizzaId)) {
      favorites.delete(pizzaId);
    } else {
      favorites.add(pizzaId);
    }
    this.favoritesSubject.next(favorites);
    this.saveToStorage(favorites, username);
  }

  getFavorites(): number[] {
    return [...this.favoritesSubject.value];
  }
}
