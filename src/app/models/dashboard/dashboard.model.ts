export interface DashboardMetrics {
  // KPIs
  todayRevenue: number;
  todayOrders: number;
  activeReservations: number;
  totalReservations: number;
  averageOrderValue: number;
  totalOrders: number;
  customerCount: number;
  revenueGrowth: number;
  orderGrowth: number;
  customerGrowth: number;

  // Time-based data
  dailyRevenueData: DailyRevenueData[];
  hourlyOrderData: HourlyOrderData[];
  weeklyTrends: WeeklyTrendData[];
  monthlyComparison: MonthlyComparisonData[];

  // Product analytics
  topProducts: TopProductData[];
  categoryBreakdown: CategoryBreakdownData[];
  productPerformance: ProductPerformanceData[];

  // Order analytics
  orderStatusDistribution: OrderStatusData[];
  recentOrders: RecentOrderData[];
  peakHours: PeakHourData[];
  averageOrderTime: number;

  // Customer analytics
  customerSegments: CustomerSegmentData[];
  repeatCustomerRate: number;
  newCustomerRate: number;

  // Financial metrics
  profitMargin: number;
  costBreakdown: CostBreakdownData[];
  paymentMethodDistribution: PaymentMethodData[];
}

export interface DailyRevenueData {
  date: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface HourlyOrderData {
  hour: string;
  orders: number;
  revenue: number;
}

export interface WeeklyTrendData {
  week: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface MonthlyComparisonData {
  month: string;
  currentYear: number;
  previousYear: number;
  growth: number;
}

export interface TopProductData {
  id: string;
  name: string;
  category: string;
  totalSold: number;
  totalRevenue: number;
  percentage: number;
  trend: number;
}

export interface CategoryBreakdownData {
  categoryName: string;
  value: number;
  percentage: number;
  color: string;
  itemCount: number;
}

export interface ProductPerformanceData {
  productId: string;
  productName: string;
  sales: number;
  revenue: number;
  profitMargin: number;
  rating: number;
}

export interface OrderStatusData {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface RecentOrderData {
  id: string;
  customerName: string;
  orderItems?: any[];
  totalAmount?: number;
  orderDate?: string;
  status: string;
}

export interface PeakHourData {
  hour: string;
  orderCount: number;
  revenue: number;
  isCurrentHour: boolean;
}

export interface CustomerSegmentData {
  segment: string;
  count: number;
  percentage: number;
  averageOrderValue: number;
  color: string;
}

export interface CostBreakdownData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface PaymentMethodData {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface DashboardFilters {
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: Date;
  endDate?: Date;
  category?: string;
  status?: string;
  sortBy?: 'revenue' | 'orders' | 'customers' | 'date';
  sortOrder?: 'asc' | 'desc';
}
