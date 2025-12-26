import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Order } from '../../models/pizza.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  searchId = '';
  order: Order | null = null;
  loading = false;
  error = '';
  searched = false;

  // Simulated order statuses for demo
  orderStatuses = [
    { status: 'confirmed', label: 'Order Confirmed', icon: '✓', time: '' },
    { status: 'preparing', label: 'Preparing', icon: '👨‍🍳', time: '' },
    { status: 'baking', label: 'Baking', icon: '🔥', time: '' },
    { status: 'ready', label: 'Ready for Delivery', icon: '📦', time: '' },
    { status: 'delivering', label: 'Out for Delivery', icon: '🚗', time: '' },
    { status: 'delivered', label: 'Delivered', icon: '🎉', time: '' }
  ];

  currentStatusIndex = 0;
  estimatedTime = '';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.searchId = params['id'];
        this.searchOrder();
      }
    });
  }

  searchOrder(): void {
    if (!this.searchId.trim()) {
      this.error = 'Please enter an order ID';
      return;
    }

    this.loading = true;
    this.error = '';
    this.searched = true;

    // First check localStorage for saved orders
    const savedOrder = this.getStoredOrder(this.searchId);
    if (savedOrder) {
      this.order = savedOrder;
      this.loading = false;
      this.calculateOrderProgress(savedOrder.orderTime);
      return;
    }

    // Check if it's a demo order without saved data
    if (this.searchId.startsWith('DEMO-')) {
      this.error = 'Order not found. Please check the order ID.';
      this.loading = false;
      return;
    }

    this.apiService.getOrder(this.searchId).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
        this.calculateOrderProgress(Date.now() - 15 * 60000); // Assume 15 min ago
      },
      error: () => {
        this.loading = false;
        this.error = 'Order not found. Please check the order ID.';
      }
    });
  }

  private getStoredOrder(orderId: string): (Order & { orderTime?: number }) | null {
    try {
      const orders = JSON.parse(localStorage.getItem('pizza_orders') || '{}');
      return orders[orderId] || null;
    } catch {
      return null;
    }
  }

  calculateOrderProgress(orderTime: number | undefined): void {
    if (!orderTime) {
      orderTime = Date.now() - 10 * 60000; // Default 10 minutes ago
    }
    
    const now = Date.now();
    const elapsedMinutes = Math.floor((now - orderTime) / 60000);
    
    // Progress through stages: each stage takes ~10 minutes
    // 0: confirmed, 1: preparing, 2: baking, 3: ready, 4: delivering, 5: delivered
    this.currentStatusIndex = Math.min(Math.floor(elapsedMinutes / 10), 5);
    
    // Set timestamps based on actual order time
    const orderDate = new Date(orderTime);
    this.orderStatuses.forEach((status, index) => {
      if (index <= this.currentStatusIndex) {
        const statusTime = new Date(orderTime! + index * 10 * 60000);
        status.time = statusTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        status.time = '';
      }
    });

    // Estimate delivery (60 min from order time)
    const deliveryTime = new Date(orderTime + 60 * 60000);
    this.estimatedTime = deliveryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Continue real-time updates
    this.startRealtimeUpdates(orderTime);
  }

  startRealtimeUpdates(orderTime: number): void {
    // Update progress every 30 seconds
    const interval = setInterval(() => {
      const elapsedMinutes = Math.floor((Date.now() - orderTime) / 60000);
      const newIndex = Math.min(Math.floor(elapsedMinutes / 10), 5);
      
      if (newIndex > this.currentStatusIndex && this.currentStatusIndex < 5) {
        this.currentStatusIndex = newIndex;
        this.orderStatuses[this.currentStatusIndex].time = 
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      if (this.currentStatusIndex >= 5) {
        clearInterval(interval);
      }
    }, 30000);
  }

  getSubtotal(): number {
    if (!this.order) return 0;
    return this.order.cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  getPriorityFee(): number {
    if (!this.order || !this.order.priority) return 0;
    return this.getSubtotal() * 0.2;
  }

  getOrderTotal(): number {
    if (!this.order) return 0;
    const subtotal = this.getSubtotal();
    const priorityFee = this.order.priority ? subtotal * 0.2 : 0;
    return subtotal + priorityFee;
  }

  isStatusComplete(index: number): boolean {
    return index <= this.currentStatusIndex;
  }

  isCurrentStatus(index: number): boolean {
    return index === this.currentStatusIndex;
  }
}
