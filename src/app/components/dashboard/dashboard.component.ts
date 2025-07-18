import {
  Component,
  inject,
  type OnInit,
  type OnDestroy,
  ViewChild,
  type ElementRef,
  type AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { Subscription } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import {
  DashboardService,
  type DashboardMetrics,
  type TopProduct,
} from '../../services/dashboard.service';

// Register Chart.js components
Chart.register(...registerables);

interface DashboardFilters {
  dateRange: string;
  sortBy: string;
  sortOrder: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('revenueChart', { static: false })
  revenueChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('ordersChart', { static: false })
  ordersChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart', { static: false })
  categoryChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart', { static: false })
  statusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('peakHoursChart', { static: false })
  peakHoursChartRef!: ElementRef<HTMLCanvasElement>;

  metrics: DashboardMetrics | null = null;
  isLoading = true;
  lastUpdated: Date | null = null;
  error: string | null = null;

  // Charts
  private revenueChart?: Chart;
  private ordersChart?: Chart;
  private categoryChart?: Chart;
  private statusChart?: Chart;
  private peakHoursChart?: Chart;

  // Filters and controls
  filters: DashboardFilters = {
    dateRange: 'today',
    sortBy: 'revenue',
    sortOrder: 'desc',
  };

  dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
  ];

  sortOptions = [
    { value: 'revenue', label: 'Revenue' },
    { value: 'orders', label: 'Orders' },
    { value: 'customers', label: 'Customers' },
    { value: 'date', label: 'Date' },
  ];

  private subscription?: Subscription;
  private dashboardService = inject(DashboardService);

  ngOnInit(): void {
    this.subscribeToMetrics();
  }

  ngAfterViewInit(): void {
    // Initialize charts after view is ready, but only once
    setTimeout(() => {
      if (this.metrics && !this.revenueChart) {
        this.initializeCharts();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.destroyCharts();
  }

  private subscribeToMetrics(): void {
    this.subscription = this.dashboardService.metrics$.subscribe({
      next: (metrics) => {
        if (metrics) {
          const isFirstLoad = !this.metrics;
          this.metrics = metrics;
          this.isLoading = false;
          this.lastUpdated = new Date();
          this.error = null;

          // Only update charts if they already exist, otherwise wait for ngAfterViewInit
          if (!isFirstLoad && this.revenueChart) {
            this.updateCharts();
          }
        }
      },
      error: (error) => {
        console.error('Dashboard metrics error:', error);
        this.error = 'Failed to load dashboard data';
        this.isLoading = false;
      },
    });
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;

    this.dashboardService.loadDashboardData().subscribe({
      next: (metrics) => {
        this.metrics = metrics;
        this.isLoading = false;
        this.lastUpdated = new Date();
        this.error = null;
        this.updateCharts();
      },
      error: (error) => {
        console.error('Dashboard metrics error:', error);
        this.error = 'Failed to load dashboard data';
        this.isLoading = false;
      },
    });
  }

  refreshData(): void {
    this.isLoading = true;
    this.error = null;

    this.dashboardService.refreshData().subscribe({
      next: (metrics) => {
        this.metrics = metrics;
        this.isLoading = false;
        this.lastUpdated = new Date();
        // Use update instead of recreating charts
        this.updateCharts();
      },
      error: (error) => {
        console.error('Manual refresh error:', error);
        this.error = 'Failed to refresh data';
        this.isLoading = false;
      },
    });
  }

  onFiltersChange(): void {
    // In a real implementation, you would pass filters to the service
    // For now, we'll just refresh the data
    this.refreshData();
  }

  exportData(format: 'csv' | 'pdf' | 'excel'): void {
    if (!this.metrics) return;

    // Convert metrics to exportable format
    const exportData = {
      summary: {
        todayOrders: this.metrics.todayOrders,
        todayRevenue: this.metrics.todayRevenue,
        averageOrderValue: this.metrics.averageOrderValue,
        orderGrowth: this.metrics.orderGrowth,
        revenueGrowth: this.metrics.revenueGrowth,
      },
      topProducts: this.metrics.topProducts,
      categoryBreakdown: this.metrics.categoryBreakdown,
      recentOrders: this.metrics.recentOrders,
      exportDate: new Date().toISOString(),
    };

    const dataStr =
      format === 'csv'
        ? this.convertToCSV(exportData)
        : JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], {
      type: format === 'csv' ? 'text/csv' : 'application/json',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-report-${
      new Date().toISOString().split('T')[0]
    }.${format}`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion for summary data
    let csv = 'Metric,Value\n';
    csv += `Today's Orders,${data.summary.todayOrders}\n`;
    csv += `Today's Revenue,${data.summary.todayRevenue}\n`;
    csv += `Average Order Value,${data.summary.averageOrderValue}\n`;
    csv += `Order Growth,${data.summary.orderGrowth}%\n`;
    csv += `Revenue Growth,${data.summary.revenueGrowth}%\n`;

    csv += '\nTop Products\n';
    csv += 'Product Name,Total Sold,Total Revenue,Percentage\n';
    data.topProducts.forEach((product: TopProduct) => {
      csv += `${product.name},${product.totalSold},${product.totalRevenue},${product.percentage}%\n`;
    });

    return csv;
  }

  // Chart initialization and management
  private initializeCharts(): void {
    if (this.metrics) {
      this.createRevenueChart();
      this.createOrdersChart();
      this.createCategoryChart();
      this.createStatusChart();
      this.createPeakHoursChart();
    }
  }

  private createRevenueChart(): void {
    if (!this.revenueChartRef?.nativeElement || !this.metrics) return;

    const ctx = this.revenueChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.metrics.dailyRevenueData.map((d) =>
          this.formatDate(d.date)
        ),
        datasets: [
          {
            label: 'Revenue ($)',
            data: this.metrics.dailyRevenueData.map((d) => d.revenue),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y',
          },
          {
            label: 'Orders',
            data: this.metrics.dailyRevenueData.map((d) => d.orders),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: false,
            tension: 0.4,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Revenue ($)',
            },
            ticks: {
              callback: (value) => this.formatCurrency(Number(value)),
            },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Orders',
            },
            grid: {
              drawOnChartArea: false,
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value =
                  context.dataset.yAxisID === 'y'
                    ? this.formatCurrency(context.parsed.y)
                    : context.parsed.y.toString();
                return `${label}: ${value}`;
              },
            },
          },
        },
      },
    });
  }

  private createOrdersChart(): void {
    if (!this.ordersChartRef?.nativeElement || !this.metrics) return;

    const ctx = this.ordersChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.ordersChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.metrics.hourlyOrderData.map((h) => h.hour),
        datasets: [
          {
            label: 'Orders',
            data: this.metrics.hourlyOrderData.map((h) => h.orders),
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: '#10b981',
            borderWidth: 1,
          },
          {
            label: 'Revenue',
            data: this.metrics.hourlyOrderData.map((h) => h.revenue),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: '#3b82f6',
            borderWidth: 1,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Orders',
            },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Revenue ($)',
            },
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              callback: (value) => this.formatCurrency(Number(value)),
            },
          },
          x: {
            title: {
              display: true,
              text: 'Hour of Day',
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value =
                  label === 'Revenue'
                    ? this.formatCurrency(context.parsed.y)
                    : context.parsed.y.toString();
                return `${label}: ${value}`;
              },
            },
          },
        },
      },
    });
  }

  private createCategoryChart(): void {
    if (!this.categoryChartRef?.nativeElement || !this.metrics) return;

    const ctx = this.categoryChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.metrics.categoryBreakdown.map((c) => c.categoryName),
        datasets: [
          {
            data: this.metrics.categoryBreakdown.map((c) => c.value),
            backgroundColor: this.metrics.categoryBreakdown.map((c) => c.color),
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = this.formatCurrency(context.parsed);
                const percentage =
                  this.metrics?.categoryBreakdown[context.dataIndex]
                    ?.percentage || 0;
                return `${label}: ${value} (${percentage.toFixed(1)}%)`;
              },
            },
          },
        },
      },
    });
  }

  private createStatusChart(): void {
    if (!this.statusChartRef?.nativeElement || !this.metrics) return;

    const ctx = this.statusChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.statusChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.metrics.orderStatusDistribution.map((s) => s.status),
        datasets: [
          {
            data: this.metrics.orderStatusDistribution.map((s) => s.count),
            backgroundColor: this.metrics.orderStatusDistribution.map(
              (s) => s.color
            ),
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const status =
                  this.metrics?.orderStatusDistribution[context.dataIndex];
                if (!status) return '';
                return `${status.status}: ${
                  status.count
                } orders (${status.percentage.toFixed(1)}%)`;
              },
            },
          },
        },
      },
    });
  }

  private createPeakHoursChart(): void {
    if (!this.peakHoursChartRef?.nativeElement || !this.metrics) return;

    const ctx = this.peakHoursChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.peakHoursChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.metrics.peakHours.map((p) => p.hour),
        datasets: [
          {
            label: 'Orders',
            data: this.metrics.peakHours.map((p) => p.orderCount),
            backgroundColor: this.metrics.peakHours.map((p) =>
              p.isCurrentHour ? '#3b82f6' : 'rgba(59, 130, 246, 0.6)'
            ),
            borderColor: '#3b82f6',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Orders',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Peak Hours',
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const isCurrentHour =
                  this.metrics?.peakHours[context.dataIndex]?.isCurrentHour;
                const suffix = isCurrentHour ? ' (Current Hour)' : '';
                return `Orders: ${context.parsed.y}${suffix}`;
              },
            },
          },
        },
      },
    });
  }

  // Chart update methods for better performance
  private updateRevenueChart(): void {
    if (!this.revenueChart || !this.metrics) return;

    this.revenueChart.data.labels = this.metrics.dailyRevenueData.map((d) =>
      this.formatDate(d.date)
    );
    this.revenueChart.data.datasets[0].data = this.metrics.dailyRevenueData.map(
      (d) => d.revenue
    );
    this.revenueChart.data.datasets[1].data = this.metrics.dailyRevenueData.map(
      (d) => d.orders
    );
    this.revenueChart.update('none'); // Use 'none' for instant update without animation
  }

  private updateOrdersChart(): void {
    if (!this.ordersChart || !this.metrics) return;

    this.ordersChart.data.labels = this.metrics.hourlyOrderData.map(
      (h) => h.hour
    );
    this.ordersChart.data.datasets[0].data = this.metrics.hourlyOrderData.map(
      (h) => h.orders
    );
    this.ordersChart.data.datasets[1].data = this.metrics.hourlyOrderData.map(
      (h) => h.revenue
    );
    this.ordersChart.update('none');
  }

  private updateCategoryChart(): void {
    if (!this.categoryChart || !this.metrics) return;

    this.categoryChart.data.labels = this.metrics.categoryBreakdown.map(
      (c) => c.categoryName
    );
    this.categoryChart.data.datasets[0].data =
      this.metrics.categoryBreakdown.map((c) => c.value);
    this.categoryChart.data.datasets[0].backgroundColor =
      this.metrics.categoryBreakdown.map((c) => c.color);
    this.categoryChart.update('none');
  }

  private updateStatusChart(): void {
    if (!this.statusChart || !this.metrics) return;

    this.statusChart.data.labels = this.metrics.orderStatusDistribution.map(
      (s) => s.status
    );
    this.statusChart.data.datasets[0].data =
      this.metrics.orderStatusDistribution.map((s) => s.count);
    this.statusChart.data.datasets[0].backgroundColor =
      this.metrics.orderStatusDistribution.map((s) => s.color);
    this.statusChart.update('none');
  }

  private updatePeakHoursChart(): void {
    if (!this.peakHoursChart || !this.metrics) return;

    this.peakHoursChart.data.labels = this.metrics.peakHours.map((p) => p.hour);
    this.peakHoursChart.data.datasets[0].data = this.metrics.peakHours.map(
      (p) => p.orderCount
    );
    this.peakHoursChart.data.datasets[0].backgroundColor =
      this.metrics.peakHours.map((p) =>
        p.isCurrentHour ? '#3b82f6' : 'rgba(59, 130, 246, 0.6)'
      );
    this.peakHoursChart.update('none');
  }

  private updateCharts(): void {
    // Only update charts if they exist and we have metrics
    if (!this.metrics) return;

    // Update existing charts with new data instead of destroying and recreating
    if (this.revenueChart) {
      this.updateRevenueChart();
    } else {
      this.createRevenueChart();
    }

    if (this.ordersChart) {
      this.updateOrdersChart();
    } else {
      this.createOrdersChart();
    }

    if (this.categoryChart) {
      this.updateCategoryChart();
    } else {
      this.createCategoryChart();
    }

    if (this.statusChart) {
      this.updateStatusChart();
    } else {
      this.createStatusChart();
    }

    if (this.peakHoursChart) {
      this.updatePeakHoursChart();
    } else {
      this.createPeakHoursChart();
    }
  }

  private destroyCharts(): void {
    if (this.revenueChart) {
      this.revenueChart.destroy();
      this.revenueChart = undefined;
    }
    if (this.ordersChart) {
      this.ordersChart.destroy();
      this.ordersChart = undefined;
    }
    if (this.categoryChart) {
      this.categoryChart.destroy();
      this.categoryChart = undefined;
    }
    if (this.statusChart) {
      this.statusChart.destroy();
      this.statusChart = undefined;
    }
    if (this.peakHoursChart) {
      this.peakHoursChart.destroy();
      this.peakHoursChart = undefined;
    }
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(dateString: string): string {
    // Verifică dacă dateString este valid înainte de a crea un obiect Date
    if (
      !dateString ||
      typeof dateString !== 'string' ||
      dateString.trim() === ''
    ) {
      console.error('Invalid dateString received by formatDate:', dateString);
      return 'Invalid Date'; // Sau o altă valoare implicită
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // Verificați dacă data este "Invalid Date"
      console.error('Date parsing failed for:', dateString);
      return 'Invalid Date';
    }
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });
  }

  formatDateTime(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getChangeIcon(value: number): string {
    if (value > 0) return 'fas fa-arrow-up';
    if (value < 0) return 'fas fa-arrow-down';
    return 'fas fa-minus';
  }

  getChangeColor(value: number): string {
    if (value > 0) return 'text-green-600 dark:text-green-400';
    if (value < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  }

  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      delivered:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      preparing:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      pending: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      completed:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return (
      statusClasses[status.toLowerCase()] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    );
  }

  getPeakHourInfo(): string {
    if (!this.metrics?.peakHours || this.metrics.peakHours.length === 0) {
      return 'N/A';
    }
    const peak = this.metrics.peakHours[0];
    return `${peak.hour} (${peak.orderCount} orders)`;
  }

  getTopPerformingProduct(): string {
    if (!this.metrics?.topProducts || this.metrics.topProducts.length === 0) {
      return 'N/A';
    }
    return this.metrics.topProducts[0].name;
  }

  getTotalDailyRevenue(): number {
    if (!this.metrics?.dailyRevenueData) return 0;
    return this.metrics.dailyRevenueData.reduce(
      (sum, day) => sum + day.revenue,
      0
    );
  }

  getTotalDailyOrders(): number {
    if (!this.metrics?.dailyRevenueData) return 0;
    return this.metrics.dailyRevenueData.reduce(
      (sum, day) => sum + day.orders,
      0
    );
  }

  getCustomerCount(): number {
    // Since we don't have direct customer count, we'll estimate from unique orders
    return this.metrics?.totalOrders || 0;
  }
}
