import {
  Component,
  type OnInit,
  type OnDestroy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Subject, takeUntil, catchError, of, finalize } from 'rxjs';

import { ActivityLogService } from '../../services/activity-log.service';
import type { ActivityLog } from '../../models/logs/activity-log.model';

/**
 * ActivityLogsComponent - Professional activity logs management interface
 *
 * Features:
 * - Real-time log monitoring with auto-refresh
 * - Advanced filtering and search capabilities
 * - Professional pagination system
 * - Responsive design with accessibility support
 * - Keyword highlighting and export functionality
 * - Error handling and loading states
 * - Dark mode support
 */
@Component({
  selector: 'app-activity-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './activity-logs.component.html',
  styleUrls: ['./activity-logs.component.css'],
})
export class ActivityLogsComponent implements OnInit, OnDestroy {
  // Service injection
  private readonly activityLogService = inject(ActivityLogService);
  private readonly destroy$ = new Subject<void>();

  // Reactive state using signals
  readonly logs = signal<ActivityLog[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Filter state
  readonly selectedLogType = signal<string>('all');
  readonly selectedOperationType = signal<string>('all');
  readonly searchTerm = signal<string>('');

  // Pagination state
  readonly currentPage = signal<number>(1);
  readonly itemsPerPage = signal<number>(10);

  // Auto-refresh state
  readonly autoRefresh = signal<boolean>(false);
  private refreshInterval: any = null;

  // Computed values
  readonly filteredLogs = computed(() => this.applyFilters());
  readonly totalItems = computed(() => this.filteredLogs().length);
  readonly totalPages = computed(() =>
    Math.ceil(this.totalItems() / this.itemsPerPage())
  );
  readonly paginatedLogs = computed(() => this.getPaginatedLogs());
  readonly activeFilterCount = computed(() => this.getActiveFilterCount());

  // Configuration
  private readonly REFRESH_INTERVAL = 30000; // 30 seconds
  private readonly ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 20, 25];

  // Keywords for highlighting
  private readonly keywords = {
    actions: [
      'created',
      'updated',
      'deleted',
      'added',
      'removed',
      'modified',
      'changed',
      'saved',
      'cancelled',
      'completed',
      'confirmed',
      'rejected',
    ],
    entities: [
      'user',
      'product',
      'order',
      'reservation',
      'category',
      'customer',
      'admin',
      'system',
      'database',
      'server',
    ],
    status: [
      'success',
      'failed',
      'error',
      'warning',
      'pending',
      'active',
      'inactive',
      'enabled',
      'disabled',
    ],
    numbers: /\b\d+\b/g,
    emails: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    ids: /\b(id|ID):\s*\w+/g,
  };

  // Filter options
  readonly logTypeOptions = [
    { value: 'all', label: 'All Types', icon: 'fas fa-list' },
    { value: 'PRODUCT', label: 'Product', icon: 'fas fa-box' },
    { value: 'CATEGORY', label: 'Category', icon: 'fas fa-tags' },
    { value: 'ORDER', label: 'Order', icon: 'fas fa-shopping-cart' },
    { value: 'RESERVATION', label: 'Reservation', icon: 'fas fa-calendar' },
    { value: 'USER', label: 'User', icon: 'fas fa-user' },
    { value: 'SYSTEM', label: 'System', icon: 'fas fa-cog' },
  ];

  readonly operationTypeOptions = [
    { value: 'all', label: 'All Operations', icon: 'fas fa-tasks' },
    { value: 'CREATE', label: 'Create', icon: 'fas fa-plus' },
    { value: 'UPDATE', label: 'Update', icon: 'fas fa-edit' },
    { value: 'DELETE', label: 'Delete', icon: 'fas fa-trash' },
    { value: 'LOGIN', label: 'Login', icon: 'fas fa-sign-in-alt' },
    { value: 'LOGOUT', label: 'Logout', icon: 'fas fa-sign-out-alt' },
  ];

  /**
   * Component initialization
   */
  ngOnInit(): void {
    this.loadLogs();
    this.setupAutoRefresh();
  }

  /**
   * Component cleanup
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearAutoRefresh();
  }

  /**
   * Load activity logs from service
   */
  async loadLogs(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const logs = await this.activityLogService
        .getLogs()
        .pipe(
          takeUntil(this.destroy$),
          catchError((error) => {
            console.error('Error loading activity logs:', error);
            this.error.set(this.getErrorMessage(error));
            return of([]);
          }),
          finalize(() => this.isLoading.set(false))
        )
        .toPromise();

      this.logs.set(logs || []);
      this.resetPagination();
    } catch (err) {
      console.error('Unexpected error:', err);
      this.error.set('An unexpected error occurred while loading logs.');
      this.isLoading.set(false);
    }
  }

  /**
   * Apply all active filters to logs
   */
  private applyFilters(): ActivityLog[] {
    let filtered = [...this.logs()].filter((log) => log != null);

    // Filter by log type
    if (this.selectedLogType() !== 'all') {
      filtered = filtered.filter(
        (log) => log?.logType === this.selectedLogType()
      );
    }

    // Filter by operation type
    if (this.selectedOperationType() !== 'all') {
      filtered = filtered.filter(
        (log) => log?.operationType === this.selectedOperationType()
      );
    }

    // Filter by search term
    const searchTerm = this.searchTerm().trim().toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log?.message?.toLowerCase().includes(searchTerm) ||
          log?.logType?.toLowerCase().includes(searchTerm) ||
          log?.operationType?.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by timestamp (newest first)
    return filtered.sort((a, b) => {
      const dateA = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
      const dateB = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
      return dateB - dateA;
    });
  }

  /**
   * Get paginated logs for current page
   */
  private getPaginatedLogs(): ActivityLog[] {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    return this.filteredLogs().slice(startIndex, endIndex);
  }

  /**
   * Get count of active filters
   */
  private getActiveFilterCount(): number {
    let count = 0;
    if (this.selectedLogType() !== 'all') count++;
    if (this.selectedOperationType() !== 'all') count++;
    if (this.searchTerm().trim()) count++;
    return count;
  }

  /**
   * Reset pagination to first page
   */
  private resetPagination(): void {
    this.currentPage.set(1);
  }

  /**
   * Get error message based on error type
   */
  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.status === 401) {
      return 'Authentication required. Please log in again.';
    } else if (error.status === 403) {
      return 'Access denied. You do not have permission to view activity logs.';
    } else if (error.status === 404) {
      return 'Activity logs service not found. Please contact support.';
    } else if (error.status >= 500) {
      return 'Server error occurred. Please try again later.';
    }
    return `An error occurred: ${error.message || 'Unknown error'}`;
  }

  /**
   * Highlight keywords in log messages
   */
  highlightKeywords(message: string): string {
    if (!message) return '';

    let highlightedMessage = message;

    // Highlight different types of keywords
    this.keywords.actions.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      highlightedMessage = highlightedMessage.replace(
        regex,
        '<span class="keyword-action">$&</span>'
      );
    });

    this.keywords.entities.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      highlightedMessage = highlightedMessage.replace(
        regex,
        '<span class="keyword-entity">$&</span>'
      );
    });

    this.keywords.status.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      highlightedMessage = highlightedMessage.replace(
        regex,
        '<span class="keyword-status">$&</span>'
      );
    });

    // Highlight numbers, emails, and IDs
    highlightedMessage = highlightedMessage.replace(
      this.keywords.numbers,
      '<span class="keyword-number">$&</span>'
    );
    highlightedMessage = highlightedMessage.replace(
      this.keywords.emails,
      '<span class="keyword-email">$&</span>'
    );
    highlightedMessage = highlightedMessage.replace(
      this.keywords.ids,
      '<span class="keyword-id">$&</span>'
    );

    // Highlight search term
    const searchTerm = this.searchTerm().trim();
    if (searchTerm) {
      const searchRegex = new RegExp(`(${searchTerm})`, 'gi');
      highlightedMessage = highlightedMessage.replace(
        searchRegex,
        '<span class="keyword-search">$1</span>'
      );
    }

    return highlightedMessage;
  }

  /**
   * Get CSS classes for log type badges
   */
  getLogTypeBadgeClasses(logType: string): string {
    const baseClasses = 'log-type-badge';
    const typeClasses: Record<string, string> = {
      PRODUCT:
        'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
      CATEGORY:
        'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700',
      ORDER:
        'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
      RESERVATION:
        'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
      USER: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700',
      SYSTEM:
        'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
    };
    return `${baseClasses} ${typeClasses[logType] || typeClasses['SYSTEM']}`;
  }

  /**
   * Get CSS classes for operation badges
   */
  getOperationBadgeClasses(operationType: string): string {
    const baseClasses = 'operation-badge';
    const operationClasses: Record<string, string> = {
      CREATE:
        'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
      UPDATE:
        'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
      DELETE:
        'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',
      LOGIN:
        'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700',
      LOGOUT:
        'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700',
    };
    return `${baseClasses} ${
      operationClasses[operationType] ||
      'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
    }`;
  }

  /**
   * Filter event handlers
   */
  onLogTypeChange(value: string): void {
    this.selectedLogType.set(value);
    this.resetPagination();
  }

  onOperationTypeChange(value: string): void {
    this.selectedOperationType.set(value);
    this.resetPagination();
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.resetPagination();
  }

  onItemsPerPageChange(value: number): void {
    this.itemsPerPage.set(value);
    this.resetPagination();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.selectedLogType.set('all');
    this.selectedOperationType.set('all');
    this.searchTerm.set('');
    this.resetPagination();
  }

  /**
   * Pagination methods
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  goToNextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    const halfRange = Math.floor(maxPagesToShow / 2);
    const totalPages = this.totalPages();
    const currentPage = this.currentPage();

    let startPage = Math.max(1, currentPage - halfRange);
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * Auto-refresh functionality
   */
  toggleAutoRefresh(): void {
    this.autoRefresh.set(!this.autoRefresh());
    if (this.autoRefresh()) {
      this.setupAutoRefresh();
    } else {
      this.clearAutoRefresh();
    }
  }

  private setupAutoRefresh(): void {
    if (this.autoRefresh()) {
      this.refreshInterval = setInterval(() => {
        this.loadLogs();
      }, this.REFRESH_INTERVAL);
    }
  }

  private clearAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Export functionality
   */
  async exportLogs(): Promise<void> {
    try {
      const dataToExport = this.filteredLogs().map((log) => ({
        ID: log.id,
        Message: log.message,
        Timestamp: log.timestamp,
        'Log Type': log.logType,
        'Operation Type': log.operationType,
      }));

      const csvContent = this.convertToCSV(dataToExport);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute(
          'download',
          `activity-logs-${new Date().toISOString().split('T')[0]}.csv`
        );
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
      // Could add a toast notification here
    }
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Utility methods
   */
  formatLogType(logType: string): string {
    if (!logType) return 'Unknown';
    return logType.charAt(0).toUpperCase() + logType.slice(1).toLowerCase();
  }

  formatOperationType(operationType: string): string {
    if (!operationType) return 'Unknown';
    return (
      operationType.charAt(0).toUpperCase() +
      operationType.slice(1).toLowerCase()
    );
  }

  getLogTypeIcon(logType: string): string {
    const iconMap: Record<string, string> = {
      PRODUCT: 'fas fa-box',
      CATEGORY: 'fas fa-tags',
      ORDER: 'fas fa-shopping-cart',
      RESERVATION: 'fas fa-calendar',
      USER: 'fas fa-user',
      SYSTEM: 'fas fa-cog',
    };
    return iconMap[logType] || 'fas fa-info-circle';
  }

  getOperationIcon(operationType: string): string {
    const iconMap: Record<string, string> = {
      CREATE: 'fas fa-plus',
      UPDATE: 'fas fa-edit',
      DELETE: 'fas fa-trash',
      LOGIN: 'fas fa-sign-in-alt',
      LOGOUT: 'fas fa-sign-out-alt',
    };
    return iconMap[operationType] || 'fas fa-question';
  }

  getOperationTypeColor(operationType: string): string {
    const colorMap: Record<string, string> = {
      CREATE: 'emerald',
      UPDATE: 'blue',
      DELETE: 'red',
      LOGIN: 'purple',
      LOGOUT: 'orange',
    };
    return colorMap[operationType] || 'slate';
  }

  formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (error) {
      return timestamp;
    }
  }

  getRelativeTime(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600)
        return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 2592000)
        return `${Math.floor(diffInSeconds / 86400)} days ago`;

      return this.formatTimestamp(timestamp);
    } catch (error) {
      return timestamp;
    }
  }

  /**
   * TrackBy function for ngFor optimization
   */
  trackByLogId(index: number, log: ActivityLog): number {
    return log?.id || index;
  }
}
