import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  type Observable,
  combineLatest,
  map,
  catchError,
  of,
  BehaviorSubject,
  timer,
} from 'rxjs';
import { switchMap, shareReplay } from 'rxjs/operators';
import { OrderService } from './order.service';
import { ProductManagementService } from './product-management.service';
import { ReservationManagementService } from './reservation-management.service';
import type { OrderDTO } from '../models/order/order.model';
import type { Product } from '../models/product/product.model';
import type { ReservationResponse } from '../models/reservation/reservation-response.model';

export interface DashboardMetrics {
  todayOrders: number;
  todayRevenue: number;
  totalOrders: number;
  activeReservations: number;
  totalReservations: number;
  averageOrderValue: number;
  orderGrowth: number;
  revenueGrowth: number;
  topProducts: TopProduct[];
  recentOrders: OrderDTO[];
  hourlyOrderData: HourlyData[];
  dailyRevenueData: DailyRevenueData[];
  categoryBreakdown: CategoryData[];
  orderStatusDistribution: StatusData[];
  peakHours: PeakHourData[];
}

export interface TopProduct {
  id: number;
  name: string;
  totalSold: number;
  totalRevenue: number;
  percentage: number;
}

export interface HourlyData {
  hour: string;
  orders: number;
  revenue: number;
}

export interface DailyRevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface CategoryData {
  categoryName: string;
  value: number;
  percentage: number;
  color: string;
}

export interface StatusData {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface PeakHourData {
  hour: string;
  orderCount: number;
  isCurrentHour: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private orderService = inject(OrderService);
  private productService = inject(ProductManagementService);
  private reservationService = inject(ReservationManagementService);

  private refreshInterval = 30000; // 30 seconds
  private metricsSubject = new BehaviorSubject<DashboardMetrics | null>(null);
  public metrics$ = this.metricsSubject.asObservable();

  constructor() {
    this.startAutoRefresh();
  }

  private startAutoRefresh(): void {
    timer(0, this.refreshInterval)
      .pipe(
        switchMap(() => this.loadDashboardData()),
        catchError((error) => {
          console.error('Dashboard data refresh error:', error);
          return of(null);
        })
      )
      .subscribe((metrics) => {
        if (metrics) {
          this.metricsSubject.next(metrics);
        }
      });
  }

  loadDashboardData(): Observable<DashboardMetrics> {
    return combineLatest([
      this.orderService.getAllOrders().pipe(catchError(() => of([]))),
      this.productService.getProducts().pipe(catchError(() => of([]))),
      this.reservationService
        .getAllReservations()
        .pipe(catchError(() => of([]))),
    ]).pipe(
      map(([orders, products, reservations]) =>
        this.calculateMetrics(orders, products, reservations)
      ),
      shareReplay(1)
    );
  }

  private calculateMetrics(
    orders: OrderDTO[],
    products: Product[],
    reservations: ReservationResponse[]
  ): DashboardMetrics {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const yesterdayStart = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate()
    );

    // Filter today's and yesterday's orders
    const todayOrders = orders.filter(
      (order) => order.orderDate && new Date(order.orderDate) >= todayStart
    );
    const yesterdayOrders = orders.filter(
      (order) =>
        order.orderDate &&
        new Date(order.orderDate) >= yesterdayStart &&
        new Date(order.orderDate) < todayStart
    );

    // Calculate basic metrics
    const todayRevenue = todayOrders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );
    const yesterdayRevenue = yesterdayOrders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    // Calculate growth percentages
    const orderGrowth =
      yesterdayOrders.length > 0
        ? ((todayOrders.length - yesterdayOrders.length) /
            yesterdayOrders.length) *
          100
        : 0;
    const revenueGrowth =
      yesterdayRevenue > 0
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
        : 0;

    // Calculate average order value
    const averageOrderValue =
      todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;

    // Active reservations (today's confirmed reservations)
    const activeReservations = reservations.filter((reservation) => {
      const reservationDate = new Date(reservation.reservationDateTime);
      return (
        reservationDate >= todayStart &&
        reservationDate <
          new Date(todayStart.getTime() + 24 * 60 * 60 * 1000) &&
        reservation.status === 'CONFIRMED'
      );
    }).length;

    return {
      todayOrders: todayOrders.length,
      todayRevenue,
      totalOrders: orders.length,
      activeReservations,
      totalReservations: reservations.length,
      averageOrderValue,
      orderGrowth,
      revenueGrowth,
      topProducts: this.calculateTopProducts(orders, products),
      recentOrders: this.getRecentOrders(orders),
      hourlyOrderData: this.calculateHourlyData(todayOrders),
      dailyRevenueData: this.calculateDailyRevenueData(orders),
      categoryBreakdown: this.calculateCategoryBreakdown(orders, products),
      orderStatusDistribution: this.calculateOrderStatusDistribution(orders),
      peakHours: this.calculatePeakHours(orders),
    };
  }

  private calculateTopProducts(
    orders: OrderDTO[],
    products: Product[]
  ): TopProduct[] {
    const productSales = new Map<number, { sold: number; revenue: number }>();

    // Calculate sales for each product
    orders.forEach((order) => {
      order.orderItems?.forEach((item) => {
        const current = productSales.get(item.productId) || {
          sold: 0,
          revenue: 0,
        };
        productSales.set(item.productId, {
          sold: current.sold + item.quantity,
          revenue: current.revenue + (item.priceAtOrder || 0) * item.quantity,
        });
      });
    });

    // Convert to array and sort by revenue
    const topProducts = Array.from(productSales.entries())
      .map(([productId, data]) => {
        const product = products.find((p) => p.id === productId);
        return {
          id: productId,
          name: product?.name || 'Unknown Product',
          totalSold: data.sold,
          totalRevenue: data.revenue,
          percentage: 0, // Will be calculated below
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    // Calculate percentages
    const totalRevenue = topProducts.reduce(
      (sum, product) => sum + product.totalRevenue,
      0
    );
    topProducts.forEach((product) => {
      product.percentage =
        totalRevenue > 0 ? (product.totalRevenue / totalRevenue) * 100 : 0;
    });

    return topProducts;
  }

  private getRecentOrders(orders: OrderDTO[]): OrderDTO[] {
    return orders
      .sort(
        (a, b) =>
          new Date(b.orderDate || 0).getTime() -
          new Date(a.orderDate || 0).getTime()
      )
      .slice(0, 5);
  }

  private calculateHourlyData(todayOrders: OrderDTO[]): HourlyData[] {
    const hourlyData: HourlyData[] = [];

    for (let hour = 0; hour < 24; hour++) {
      const hourOrders = todayOrders.filter((order) => {
        const orderHour = new Date(order.orderDate || 0).getHours();
        return orderHour === hour;
      });

      hourlyData.push({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        orders: hourOrders.length,
        revenue: hourOrders.reduce(
          (sum, order) => sum + (order.totalAmount || 0),
          0
        ),
      });
    }

    return hourlyData;
  }

  private calculateDailyRevenueData(orders: OrderDTO[]): DailyRevenueData[] {
    const last7Days = new Map<string, { revenue: number; orders: number }>();

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last7Days.set(dateStr, { revenue: 0, orders: 0 });
    }

    // Aggregate data
    orders.forEach((order) => {
      // Asigură-te că order.orderDate există și este un șir
      if (
        order.orderDate &&
        typeof order.orderDate === 'string' &&
        order.orderDate.trim() !== ''
      ) {
        const dateObj = new Date(order.orderDate);

        // *** Adăugați această verificare pentru a preveni RangeError ***
        if (isNaN(dateObj.getTime())) {
          console.warn(
            'Skipping order with invalid orderDate:',
            order.orderDate,
            'for Order ID:',
            order.id
          );
          return; // Sari peste această comandă și continuă cu următoarea
        }

        const dateStr = dateObj.toISOString().split('T')[0];
        if (last7Days.has(dateStr)) {
          const current = last7Days.get(dateStr)!;
          last7Days.set(dateStr, {
            revenue: current.revenue + (order.totalAmount || 0),
            orders: current.orders + 1,
          });
        }
      } else {
        // Opțional: loghează comenzile cu orderDate lipsă sau invalid
        console.warn(
          'Order with missing or invalid orderDate encountered:',
          order
        );
      }
    });

    return Array.from(last7Days.entries()).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
    }));
  }

  private calculateCategoryBreakdown(
    orders: OrderDTO[],
    products: Product[]
  ): CategoryData[] {
    const categoryRevenue = new Map<string, number>();

    orders.forEach((order) => {
      order.orderItems?.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          const categoryName = this.getCategoryName(
            product.categoryId,
            products
          );
          const revenue = (item.priceAtOrder || 0) * item.quantity;
          categoryRevenue.set(
            categoryName,
            (categoryRevenue.get(categoryName) || 0) + revenue
          );
        }
      });
    });

    const totalRevenue = Array.from(categoryRevenue.values()).reduce(
      (sum, revenue) => sum + revenue,
      0
    );
    const colors = [
      '#3B82F6',
      '#10B981',
      '#F59E0B',
      '#EF4444',
      '#8B5CF6',
      '#06B6D4',
    ];

    return Array.from(categoryRevenue.entries())
      .map(([categoryName, value], index) => ({
        categoryName,
        value,
        percentage: totalRevenue > 0 ? (value / totalRevenue) * 100 : 0,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value);
  }

  private calculateOrderStatusDistribution(orders: OrderDTO[]): StatusData[] {
    // Since we don't have order status in the current model, we'll simulate based on order age
    const now = new Date();
    const statusCounts = {
      Delivered: 0,
      Preparing: 0,
      Pending: 0,
    };

    orders.forEach((order) => {
      if (order.orderDate) {
        const orderDate = new Date(order.orderDate);
        const hoursDiff =
          (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);

        if (hoursDiff > 2) {
          statusCounts['Delivered']++;
        } else if (hoursDiff > 0.5) {
          statusCounts['Preparing']++;
        } else {
          statusCounts['Pending']++;
        }
      }
    });

    const total = Object.values(statusCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    const colors = {
      Delivered: '#10B981',
      Preparing: '#F59E0B',
      Pending: '#EF4444',
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
      color: colors[status as keyof typeof colors],
    }));
  }

  private calculatePeakHours(orders: OrderDTO[]): PeakHourData[] {
    const hourCounts = new Map<number, number>();
    const currentHour = new Date().getHours();

    // Count orders by hour
    orders.forEach((order) => {
      if (order.orderDate) {
        const hour = new Date(order.orderDate).getHours();
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      }
    });

    // Convert to array and sort by count
    return Array.from(hourCounts.entries())
      .map(([hour, count]) => ({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        orderCount: count,
        isCurrentHour: hour === currentHour,
      }))
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 6);
  }

  private getCategoryName(categoryId: number, products: Product[]): string {
    // Since we don't have a direct category service, we'll extract from products
    // This is a simplified approach - in a real app, you'd have a category service
    const categoryMap = new Map<number, string>();
    categoryMap.set(1, 'Pizza');
    categoryMap.set(2, 'Pasta');
    categoryMap.set(3, 'Salads');
    categoryMap.set(4, 'Desserts');
    categoryMap.set(5, 'Beverages');

    return categoryMap.get(categoryId) || 'Other';
  }

  // Manual refresh method
  refreshData(): Observable<DashboardMetrics> {
    return this.loadDashboardData();
  }

  // Get current metrics without refresh
  getCurrentMetrics(): DashboardMetrics | null {
    return this.metricsSubject.value;
  }
}
