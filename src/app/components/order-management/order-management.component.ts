import { Component, inject, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  type FormGroup,
  type FormArray,
  Validators,
} from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { ProductManagementService } from '../../services/product-management.service';
import type {
  OrderDTO,
  CreateOrderRequest,
  OrderItemDTO,
} from '../../models/order/order.model';
import type { Product } from '../../models/product/product.model';

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface OrderFilter {
  searchTerm: string;
  dateFrom: string;
  dateTo: string;
  minAmount: number | null;
  maxAmount: number | null;
  sortBy: 'orderDate' | 'totalAmount' | 'customerName';
  sortDirection: 'asc' | 'desc';
}

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.css'],
})
export class OrderManagementComponent implements OnInit {
  // Modal states
  showOrderModal = false;
  showDeleteConfirmModal = false;
  showOrderDetailsModal = false;

  // Edit mode
  isEditingOrder = false;
  editingOrderId?: number;

  // Loading states
  isLoading = false;
  isSaving = false;
  isLoadingProducts = false;

  // Data
  orders: OrderDTO[] = [];
  products: Product[] = [];
  filteredOrders: OrderDTO[] = [];
  selectedOrder?: OrderDTO;

  // Forms
  orderForm: FormGroup;
  filterForm: FormGroup;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Filter state
  filters: OrderFilter = {
    searchTerm: '',
    dateFrom: '',
    dateTo: '',
    minAmount: null,
    maxAmount: null,
    sortBy: 'orderDate',
    sortDirection: 'desc',
  };

  // Advanced filter state
  activeFilters: string[] = [];
  timeFilter: 'all' | 'past' | 'today' | 'future' = 'today';
  statusFilter: 'all' | 'pending' | 'confirmed' | 'delivered' | 'cancelled' =
    'all';

  // Delete confirmation
  deleteOrder: { id: number; customerName: string } | null = null;

  // Notification system
  notifications: Notification[] = [];
  private notificationIdCounter = 1;

  // Services
  private orderService = inject(OrderService);
  private productService = inject(ProductManagementService);
  private fb = inject(FormBuilder);

  constructor() {
    this.orderForm = this.createOrderForm();
    this.filterForm = this.createFilterForm();
  }

  ngOnInit(): void {
    this.timeFilter = 'today'; // Set default to today's orders
    this.loadOrders();
    this.loadProducts();
    this.setupFilterSubscription();
  }

  // Form creation
  private createOrderForm(): FormGroup {
    return this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(2)]],
      customerAddress: ['', [Validators.required, Validators.minLength(5)]],
      orderItems: this.fb.array([]),
    });
  }

  private createFilterForm(): FormGroup {
    return this.fb.group({
      searchTerm: [''],
      dateFrom: [''],
      dateTo: [''],
      minAmount: [null],
      maxAmount: [null],
      sortBy: ['orderDate'],
      sortDirection: ['desc'],
    });
  }

  private createOrderItemForm(item?: OrderItemDTO): FormGroup {
    return this.fb.group({
      productId: [item?.productId || '', Validators.required],
      quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
      priceAtOrder: [item?.priceAtOrder || 0],
    });
  }

  // Form getters
  get orderItems(): FormArray {
    return this.orderForm.get('orderItems') as FormArray;
  }

  get paginatedOrders(): OrderDTO[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
  }

  // Data loading
  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.applyFilters();
        this.isLoading = false;
        this.showNotification('Orders loaded successfully!');
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.showNotification('Failed to load orders', 'error');
        this.isLoading = false;
      },
    });
  }

  loadProducts(): void {
    this.isLoadingProducts = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.isLoadingProducts = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.showNotification('Failed to load products', 'error');
        this.isLoadingProducts = false;
      },
    });
  }

  // Filter and search functionality
  private setupFilterSubscription(): void {
    this.filterForm.valueChanges.subscribe((filterValues) => {
      this.filters = { ...this.filters, ...filterValues };
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let filtered = [...this.orders];
    this.activeFilters = [];

    // Time-based filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (this.timeFilter) {
      case 'past':
        filtered = filtered.filter(
          (order) => order.orderDate && new Date(order.orderDate) < today
        );
        this.activeFilters.push('Past Orders');
        break;
      case 'today':
        filtered = filtered.filter((order) => {
          if (!order.orderDate) return false;
          const orderDate = new Date(order.orderDate);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === today.getTime();
        });
        this.activeFilters.push("Today's Orders");
        break;
      case 'future':
        filtered = filtered.filter(
          (order) => order.orderDate && new Date(order.orderDate) >= tomorrow
        );
        this.activeFilters.push('Future Orders');
        break;
    }

    // Search filter
    if (this.filters.searchTerm) {
      const searchTerm = this.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.customerName.toLowerCase().includes(searchTerm) ||
          order.customerAddress.toLowerCase().includes(searchTerm) ||
          order.id?.toString().includes(searchTerm)
      );
      this.activeFilters.push(`Search: "${this.filters.searchTerm}"`);
    }

    // Date range filter (only if not using time filter)
    if (this.timeFilter === 'all') {
      if (this.filters.dateFrom) {
        filtered = filtered.filter(
          (order) =>
            order.orderDate &&
            new Date(order.orderDate) >= new Date(this.filters.dateFrom)
        );
        this.activeFilters.push(
          `From: ${this.formatDate(this.filters.dateFrom)}`
        );
      }

      if (this.filters.dateTo) {
        filtered = filtered.filter(
          (order) =>
            order.orderDate &&
            new Date(order.orderDate) <= new Date(this.filters.dateTo)
        );
        this.activeFilters.push(`To: ${this.formatDate(this.filters.dateTo)}`);
      }
    }

    // Amount range filter
    if (this.filters.minAmount !== null && this.filters.minAmount > 0) {
      filtered = filtered.filter(
        (order) =>
          order.totalAmount && order.totalAmount >= this.filters.minAmount!
      );
      this.activeFilters.push(
        `Min: ${this.formatCurrency(this.filters.minAmount)}`
      );
    }

    if (this.filters.maxAmount !== null && this.filters.maxAmount > 0) {
      filtered = filtered.filter(
        (order) =>
          order.totalAmount && order.totalAmount <= this.filters.maxAmount!
      );
      this.activeFilters.push(
        `Max: ${this.formatCurrency(this.filters.maxAmount)}`
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (this.filters.sortBy) {
        case 'orderDate':
          aValue = new Date(a.orderDate || 0);
          bValue = new Date(b.orderDate || 0);
          break;
        case 'totalAmount':
          aValue = a.totalAmount || 0;
          bValue = b.totalAmount || 0;
          break;
        case 'customerName':
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return this.filters.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.filters.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredOrders = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1; // Reset to first page when filters change
  }

  // Order item management
  addOrderItem(): void {
    this.orderItems.push(this.createOrderItemForm());
  }

  removeOrderItem(index: number): void {
    this.orderItems.removeAt(index);
    this.calculateTotal();
  }

  onProductChange(index: number): void {
    const productId = this.orderItems.at(index).get('productId')?.value;
    const product = this.products.find((p) => p.id === Number(productId));

    if (product) {
      this.orderItems.at(index).patchValue({
        priceAtOrder: product.price,
      });
      this.calculateTotal();
    }
  }

  onQuantityChange(): void {
    this.calculateTotal();
  }

  calculateTotal(): number {
    let total = 0;
    this.orderItems.controls.forEach((control) => {
      const quantity = control.get('quantity')?.value || 0;
      const price = control.get('priceAtOrder')?.value || 0;
      total += quantity * price;
    });
    return total;
  }

  // Modal management
  openOrderModal(order?: OrderDTO): void {
    this.showOrderModal = true;

    if (order) {
      this.isEditingOrder = true;
      this.editingOrderId = order.id;
      this.populateOrderForm(order);
    } else {
      this.resetOrderForm();
      this.addOrderItem(); // Start with one item
    }
  }

  closeOrderModal(): void {
    this.showOrderModal = false;
    this.resetOrderForm();
  }

  openOrderDetailsModal(order: OrderDTO): void {
    this.selectedOrder = order;
    this.showOrderDetailsModal = true;
  }

  closeOrderDetailsModal(): void {
    this.selectedOrder = undefined;
    this.showOrderDetailsModal = false;
  }

  // Form management
  private populateOrderForm(order: OrderDTO): void {
    this.orderForm.patchValue({
      customerName: order.customerName,
      customerAddress: order.customerAddress,
    });

    // Clear existing items
    while (this.orderItems.length !== 0) {
      this.orderItems.removeAt(0);
    }

    // Add order items
    if (order.orderItems) {
      order.orderItems.forEach((item) => {
        this.orderItems.push(this.createOrderItemForm(item));
      });
    }
  }

  private resetOrderForm(): void {
    this.orderForm.reset();
    this.isEditingOrder = false;
    this.editingOrderId = undefined;

    // Clear order items
    while (this.orderItems.length !== 0) {
      this.orderItems.removeAt(0);
    }
  }

  // CRUD operations
  saveOrder(): void {
    if (!this.orderForm.valid) {
      this.showNotification(
        'Please fill in all required fields correctly',
        'error'
      );
      return;
    }

    this.isSaving = true;
    const formValue = this.orderForm.value;

    if (this.isEditingOrder && this.editingOrderId) {
      // Update existing order
      const orderDTO: OrderDTO = {
        id: this.editingOrderId,
        customerName: formValue.customerName,
        customerAddress: formValue.customerAddress,
        orderItems: formValue.orderItems,
      };

      this.orderService.updateOrder(this.editingOrderId, orderDTO).subscribe({
        next: (updatedOrder) => {
          const index = this.orders.findIndex(
            (o) => o.id === this.editingOrderId
          );
          if (index !== -1) {
            this.orders[index] = updatedOrder;
          }
          this.applyFilters();
          this.closeOrderModal();
          this.showNotification('Order updated successfully!');
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error updating order:', error);
          this.showNotification('Failed to update order', 'error');
          this.isSaving = false;
        },
      });
    } else {
      // Create new order
      const createRequest: CreateOrderRequest = {
        customerName: formValue.customerName,
        customerAddress: formValue.customerAddress,
        items: formValue.orderItems.map((item: any) => ({
          productId: Number(item.productId),
          quantity: item.quantity,
        })),
      };

      this.orderService.createOrder(createRequest).subscribe({
        next: (newOrder) => {
          this.orders.unshift(newOrder);
          this.applyFilters();
          this.closeOrderModal();
          this.showNotification('Order created successfully!');
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error creating order:', error);
          this.showNotification('Failed to create order', 'error');
          this.isSaving = false;
        },
      });
    }
  }

  // Delete functionality
  confirmDeleteOrder(order: OrderDTO): void {
    this.deleteOrder = { id: order.id!, customerName: order.customerName };
    this.showDeleteConfirmModal = true;
  }

  cancelDelete(): void {
    this.deleteOrder = null;
    this.showDeleteConfirmModal = false;
  }

  executeDelete(): void {
    if (!this.deleteOrder) return;

    this.orderService.deleteOrder(this.deleteOrder.id).subscribe({
      next: () => {
        this.orders = this.orders.filter((o) => o.id !== this.deleteOrder!.id);
        this.applyFilters();
        this.showNotification(
          `Order for ${this.deleteOrder!.customerName} deleted successfully!`
        );
        this.cancelDelete();
      },
      error: (error) => {
        console.error('Error deleting order:', error);
        this.showNotification('Failed to delete order', 'error');
        this.cancelDelete();
      },
    });
  }

  // Pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Utility methods
  getProductName(productId: number): string {
    const product = this.products.find((p) => p.id === productId);
    return product ? product.name : 'Unknown Product';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  clearFilters(): void {
    this.filterForm.reset({
      searchTerm: '',
      dateFrom: '',
      dateTo: '',
      minAmount: null,
      maxAmount: null,
      sortBy: 'orderDate',
      sortDirection: 'desc',
    });
  }

  exportOrders(): void {
    // Implement export functionality
    this.showNotification('Export functionality coming soon!', 'info');
  }

  // Time filter methods
  setTimeFilter(filter: 'all' | 'past' | 'today' | 'future'): void {
    this.timeFilter = filter;
    // Clear date range filters when using time filter
    if (filter !== 'all') {
      this.filterForm.patchValue({
        dateFrom: '',
        dateTo: '',
      });
    }
    this.applyFilters();
  }

  // Clear all filters
  clearAllFilters(): void {
    this.timeFilter = 'all';
    this.statusFilter = 'all';
    this.filterForm.reset({
      searchTerm: '',
      dateFrom: '',
      dateTo: '',
      minAmount: null,
      maxAmount: null,
      sortBy: 'orderDate',
      sortDirection: 'desc',
    });
    this.applyFilters();
  }

  // Get active filter count
  getActiveFilterCount(): number {
    return this.activeFilters.length;
  }

  // Math utility method for template
  mathMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  // Notification system
  showNotification(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'success'
  ): void {
    const notification: Notification = {
      id: this.notificationIdCounter++,
      message,
      type,
    };

    this.notifications.push(notification);

    setTimeout(() => {
      this.removeNotification(notification.id);
    }, 5000);
  }

  removeNotification(id: number): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
  }
}
