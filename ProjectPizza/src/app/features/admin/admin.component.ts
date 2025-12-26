import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

interface OrderStats {
  today: number;
  week: number;
  month: number;
  revenue: number;
}

interface PopularPizza {
  name: string;
  orders: number;
  revenue: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit, AfterViewInit {
  @ViewChild('salesChart') salesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pizzaChart') pizzaChartRef!: ElementRef<HTMLCanvasElement>;

  stats: OrderStats = {
    today: 42,
    week: 287,
    month: 1243,
    revenue: 15678.50
  };

  popularPizzas: PopularPizza[] = [
    { name: 'Margherita', orders: 342, revenue: 3420 },
    { name: 'Pepperoni', orders: 298, revenue: 3576 },
    { name: 'Quattro Formaggi', orders: 187, revenue: 2618 },
    { name: 'Diavola', orders: 156, revenue: 2184 },
    { name: 'Hawaiiana', orders: 134, revenue: 1742 }
  ];

  recentOrders = [
    { id: 'ORD-001', customer: 'John D.', items: 3, total: 42.50, status: 'Delivered', time: '10 min ago' },
    { id: 'ORD-002', customer: 'Sarah M.', items: 2, total: 28.00, status: 'Preparing', time: '25 min ago' },
    { id: 'ORD-003', customer: 'Mike R.', items: 4, total: 56.75, status: 'Baking', time: '32 min ago' },
    { id: 'ORD-004', customer: 'Emma L.', items: 1, total: 15.00, status: 'Delivering', time: '45 min ago' },
    { id: 'ORD-005', customer: 'David K.', items: 2, total: 31.50, status: 'Delivered', time: '1 hour ago' }
  ];

  private salesChart: Chart | null = null;
  private pizzaChart: Chart | null = null;

  ngOnInit(): void {
    // Simulate real-time data updates
    this.startRealtimeUpdates();
  }

  ngAfterViewInit(): void {
    this.initCharts();
  }

  initCharts(): void {
    // Sales Chart (Line)
    if (this.salesChartRef?.nativeElement) {
      this.salesChart = new Chart(this.salesChartRef.nativeElement, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Orders',
            data: [35, 42, 38, 51, 49, 62, 55],
            borderColor: '#e63946',
            backgroundColor: 'rgba(230, 57, 70, 0.1)',
            tension: 0.4,
            fill: true
          }, {
            label: 'Revenue ($)',
            data: [420, 504, 456, 612, 588, 744, 660],
            borderColor: '#2a9d8f',
            backgroundColor: 'rgba(42, 157, 143, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'revenue'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Orders'
              }
            },
            revenue: {
              position: 'right',
              beginAtZero: true,
              title: {
                display: true,
                text: 'Revenue ($)'
              },
              grid: {
                drawOnChartArea: false
              }
            }
          }
        }
      });
    }

    // Pizza Popularity Chart (Doughnut)
    if (this.pizzaChartRef?.nativeElement) {
      this.pizzaChart = new Chart(this.pizzaChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: this.popularPizzas.map(p => p.name),
          datasets: [{
            data: this.popularPizzas.map(p => p.orders),
            backgroundColor: [
              '#e63946',
              '#f4a261',
              '#2a9d8f',
              '#264653',
              '#e9c46a'
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right'
            }
          }
        }
      });
    }
  }

  startRealtimeUpdates(): void {
    // Simulate order count updates
    setInterval(() => {
      this.stats.today += Math.floor(Math.random() * 2);
    }, 30000);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'delivered': return 'badge-success';
      case 'preparing': return 'badge-warning';
      case 'baking': return 'badge-primary';
      case 'delivering': return 'badge-info';
      default: return 'badge-secondary';
    }
  }

  refreshData(): void {
    // Simulate data refresh
    this.stats.today += Math.floor(Math.random() * 5);
    this.stats.revenue += Math.random() * 100;
  }
}
