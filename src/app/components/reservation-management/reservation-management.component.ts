import { Component, inject, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationManagementService } from '../../services/reservation-management.service';
import type { ReservationResponse } from '../../models/reservation/reservation-response.model';
import type { AdminReservationRequest } from '../../models/reservation/admin-reservation-request.model';
import { ReservationStatus } from '../../models/reservation/reservation-status.enum';

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  reservations: ReservationResponse[];
}

@Component({
  selector: 'app-reservation-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation-management.component.html',
  styleUrls: ['./reservation-management.component.css'],
})
export class ReservationManagementComponent implements OnInit {
  // Modal states
  showReservationModal = false;
  showReservationDetailsModal = false;
  showDeleteConfirmModal = false;

  // Edit mode
  isEditingReservation = false;
  editingReservationId?: number;

  // Calendar state
  currentDate = new Date();
  calendarDays: CalendarDay[] = [];
  selectedDate?: Date;

  // View mode
  currentView: 'calendar' | 'list' = 'calendar';

  // Delete confirmation
  deleteReservation: { id: number; customerName: string } | null = null;

  // Selected reservation for details
  selectedReservation?: ReservationResponse;

  // Form object
  newReservation: AdminReservationRequest = {
    customerName: '',
    phoneNumber: '',
    reservationDateTime: '',
    numberOfPeople: 1,
    status: ReservationStatus.PENDING,
  };

  // Notification system
  notifications: Notification[] = [];
  private notificationIdCounter = 1;

  // Data arrays
  reservations: ReservationResponse[] = [];
  filteredReservations: ReservationResponse[] = [];

  // Enum reference for template
  ReservationStatus = ReservationStatus;

  // Filter properties
  reservationFilters = {
    searchTerm: '',
    statusFilter: 'all' as 'all' | ReservationStatus,
    timeFilter: 'today' as
      | 'today'
      | 'tomorrow'
      | 'week'
      | 'month'
      | 'all'
      | 'custom',
    customStartDate: '',
    customEndDate: '',
  };

  // Filtered reservations for list view
  filteredListReservations: ReservationResponse[] = [];

  private reservationService = inject(ReservationManagementService);

  ngOnInit(): void {
    this.loadReservations();
    this.generateCalendar();
    this.initializeFilters();
  }

  // Notification Methods
  showNotification(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'success'
  ) {
    const notification: Notification = {
      id: this.notificationIdCounter++,
      message,
      type,
    };

    this.notifications.push(notification);

    setTimeout(() => {
      this.removeNotification(notification.id);
    }, 3000);
  }

  removeNotification(id: number) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
  }

  // Calendar Methods
  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    this.calendarDays = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayReservations = this.reservations.filter((reservation) => {
        const reservationDate = new Date(reservation.reservationDateTime);
        return this.isSameDay(reservationDate, currentDate);
      });

      this.calendarDays.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        reservations: dayReservations,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }

  selectDate(date: Date) {
    this.selectedDate = date;
    this.filteredReservations = this.reservations.filter((reservation) => {
      const reservationDate = new Date(reservation.reservationDateTime);
      return this.isSameDay(reservationDate, date);
    });
  }

  // Date validation methods
  isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  }

  isPastReservationDate(): boolean {
    if (!this.newReservation.reservationDateTime) return false;

    const reservationDate = new Date(this.newReservation.reservationDateTime);
    const now = new Date();

    // If editing an existing reservation, allow past dates
    if (this.isEditingReservation) return false;

    return reservationDate < now;
  }

  getTodayDateTimeString(): string {
    const now = new Date();
    return this.formatDateTimeForInput(now);
  }

  // Reservation CRUD Methods
  loadReservations() {
    this.reservationService.getAllReservations().subscribe({
      next: (data) => {
        this.reservations = data;
        this.generateCalendar();
        this.applyListFilters(); // Add this line
        this.showNotification('Reservations loaded successfully!');
      },
      error: (err) => {
        console.error('Error loading reservations', err);
        this.showNotification('Failed to load reservations', 'error');
      },
    });
  }

  openReservationModal(reservation?: ReservationResponse, selectedDate?: Date) {
    // Close details modal if it's open (when editing from details view)
    if (this.showReservationDetailsModal) {
      this.closeReservationDetails();
    }

    this.showReservationModal = true;
    if (reservation) {
      this.isEditingReservation = true;
      this.editingReservationId = reservation.id;
      this.newReservation = {
        customerName: reservation.customerName,
        phoneNumber: reservation.phoneNumber,
        reservationDateTime: reservation.reservationDateTime,
        numberOfPeople: reservation.numberOfPeople,
        status: reservation.status,
      };
    } else {
      this.resetReservationForm();
      if (selectedDate) {
        // Check if selected date is in the past
        if (this.isPastDate(selectedDate)) {
          this.showNotification(
            'Cannot create reservations for past dates',
            'warning'
          );
          return;
        }

        const dateTime = new Date(selectedDate);
        dateTime.setHours(19, 0, 0, 0); // Default to 7 PM
        this.newReservation.reservationDateTime =
          this.formatDateTimeForInput(dateTime);
      }
    }
  }

  closeReservationModal() {
    this.showReservationModal = false;
    this.resetReservationForm();
  }

  resetReservationForm() {
    this.newReservation = {
      customerName: '',
      phoneNumber: '',
      reservationDateTime: '',
      numberOfPeople: 1,
      status: ReservationStatus.PENDING,
    };
    this.isEditingReservation = false;
    this.editingReservationId = undefined;
  }

  saveReservation() {
    if (
      this.newReservation.customerName &&
      this.newReservation.phoneNumber &&
      this.newReservation.reservationDateTime &&
      this.newReservation.numberOfPeople > 0
    ) {
      // Check if trying to create a reservation for a past date
      if (!this.isEditingReservation && this.isPastReservationDate()) {
        this.showNotification(
          'Cannot create reservations for past dates',
          'error'
        );
        return;
      }

      if (this.isEditingReservation && this.editingReservationId) {
        // For editing, we need to create a new reservation since the API doesn't have an update endpoint
        // In a real scenario, you'd have an update endpoint
        this.showNotification(
          'Editing reservations requires API update endpoint',
          'warning'
        );
      } else {
        // Create new reservation
        this.reservationService
          .createAdminReservation(this.newReservation)
          .subscribe({
            next: (created) => {
              this.reservations.push(created);
              this.generateCalendar();
              this.closeReservationModal();
              this.showNotification('Reservation created successfully!');
            },
            error: (err) => {
              console.error('Error creating reservation', err);
              this.showNotification('Failed to create reservation', 'error');
            },
          });
      }
    }
  }

  // Delete Methods
  confirmDeleteReservation(reservation: ReservationResponse) {
    // Set the delete reservation data first
    this.deleteReservation = {
      id: reservation.id,
      customerName: reservation.customerName,
    };

    // Show the delete confirmation modal
    this.showDeleteConfirmModal = true;

    // No need to explicitly close the details modal - the z-index will ensure proper stacking
    // The details modal will remain visible behind the delete modal
  }

  cancelDelete() {
    this.deleteReservation = null;
    this.showDeleteConfirmModal = false;
  }

  executeDelete() {
    if (!this.deleteReservation) return;

    this.reservationService
      .deleteReservation(this.deleteReservation.id)
      .subscribe({
        next: () => {
          this.reservations = this.reservations.filter(
            (r) => r.id !== this.deleteReservation!.id
          );
          this.generateCalendar();
          this.showNotification(
            `Reservation for ${
              this.deleteReservation!.customerName
            } deleted successfully!`
          );

          // Close both modals after successful deletion
          this.showDeleteConfirmModal = false;
          this.showReservationDetailsModal = false;
          this.deleteReservation = null;
          this.selectedReservation = undefined;
        },
        error: (err) => {
          console.error('Error deleting reservation', err);
          this.showNotification('Failed to delete reservation', 'error');
          this.cancelDelete();
        },
      });
  }

  // Status update
  updateReservationStatus(
    reservation: ReservationResponse,
    newStatus: ReservationStatus
  ) {
    this.reservationService
      .updateReservationStatus(reservation.id, { status: newStatus })
      .subscribe({
        next: () => {
          const index = this.reservations.findIndex(
            (r) => r.id === reservation.id
          );
          if (index !== -1) {
            this.reservations[index].status = newStatus;
            this.generateCalendar();
          }
          this.showNotification(`Reservation status updated to ${newStatus}`);
        },
        error: (err) => {
          console.error('Error updating reservation status', err);
          this.showNotification('Failed to update reservation status', 'error');
        },
      });
  }

  // Details view
  showReservationDetails(reservation: ReservationResponse) {
    this.selectedReservation = reservation;
    this.showReservationDetailsModal = true;
  }

  closeReservationDetails() {
    this.selectedReservation = undefined;
    this.showReservationDetailsModal = false;
  }

  // Helper Methods
  formatDateTimeForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  formatDateTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  }

  formatDate(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString();
  }

  formatTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getStatusColor(status: ReservationStatus): string {
    switch (status) {
      case ReservationStatus.CONFIRMED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case ReservationStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case ReservationStatus.CANCELLED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  getMonthName(): string {
    return this.currentDate.toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return this.isSameDay(date, today);
  }

  switchView(view: 'calendar' | 'list') {
    this.currentView = view;
  }

  // Method to close all modals
  closeAllModals() {
    this.showReservationModal = false;
    this.showReservationDetailsModal = false;
    this.showDeleteConfirmModal = false;
    this.resetReservationForm();
    this.selectedReservation = undefined;
    this.deleteReservation = null;
  }

  // Method to safely open a modal (closes others first)
  safeOpenModal(modalType: 'reservation' | 'details' | 'delete') {
    this.closeAllModals();

    switch (modalType) {
      case 'reservation':
        this.showReservationModal = true;
        break;
      case 'details':
        this.showReservationDetailsModal = true;
        break;
      case 'delete':
        this.showDeleteConfirmModal = true;
        break;
    }
  }

  // Filter Methods
  initializeFilters() {
    // Set default filter to today's reservations
    this.reservationFilters.timeFilter = 'today';
    this.applyListFilters();
  }

  applyListFilters() {
    let filtered = [...this.reservations];

    // Apply search filter
    if (this.reservationFilters.searchTerm.trim()) {
      const searchTerm = this.reservationFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (reservation) =>
          reservation.customerName.toLowerCase().includes(searchTerm) ||
          reservation.phoneNumber.includes(searchTerm)
      );
    }

    // Apply status filter
    if (this.reservationFilters.statusFilter !== 'all') {
      filtered = filtered.filter(
        (reservation) =>
          reservation.status === this.reservationFilters.statusFilter
      );
    }

    // Apply time filter
    filtered = this.applyTimeFilter(filtered);

    this.filteredListReservations = filtered;
  }

  applyTimeFilter(reservations: ReservationResponse[]): ReservationResponse[] {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (this.reservationFilters.timeFilter) {
      case 'today':
        return reservations.filter((reservation) => {
          const reservationDate = new Date(reservation.reservationDateTime);
          return this.isSameDay(reservationDate, today);
        });

      case 'tomorrow':
        return reservations.filter((reservation) => {
          const reservationDate = new Date(reservation.reservationDateTime);
          return this.isSameDay(reservationDate, tomorrow);
        });

      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        return reservations.filter((reservation) => {
          const reservationDate = new Date(reservation.reservationDateTime);
          return reservationDate >= weekStart && reservationDate <= weekEnd;
        });

      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);

        return reservations.filter((reservation) => {
          const reservationDate = new Date(reservation.reservationDateTime);
          return reservationDate >= monthStart && reservationDate <= monthEnd;
        });

      case 'custom':
        if (
          this.reservationFilters.customStartDate &&
          this.reservationFilters.customEndDate
        ) {
          const startDate = new Date(this.reservationFilters.customStartDate);
          const endDate = new Date(this.reservationFilters.customEndDate);
          endDate.setHours(23, 59, 59, 999);

          return reservations.filter((reservation) => {
            const reservationDate = new Date(reservation.reservationDateTime);
            return reservationDate >= startDate && reservationDate <= endDate;
          });
        }
        return reservations;

      case 'all':
      default:
        return reservations;
    }
  }

  setTimeFilter(
    filter: 'today' | 'tomorrow' | 'week' | 'month' | 'all' | 'custom'
  ) {
    this.reservationFilters.timeFilter = filter;
    if (filter !== 'custom') {
      this.reservationFilters.customStartDate = '';
      this.reservationFilters.customEndDate = '';
    }
    this.applyListFilters();
  }

  setStatusFilter(status: 'all' | ReservationStatus) {
    this.reservationFilters.statusFilter = status;
    this.applyListFilters();
  }

  onSearchChange() {
    this.applyListFilters();
  }

  onCustomDateChange() {
    if (this.reservationFilters.timeFilter === 'custom') {
      this.applyListFilters();
    }
  }

  resetFilters() {
    this.reservationFilters = {
      searchTerm: '',
      statusFilter: 'all',
      timeFilter: 'all',
      customStartDate: '',
      customEndDate: '',
    };
    this.applyListFilters();
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.reservationFilters.searchTerm.trim()) count++;
    if (this.reservationFilters.statusFilter !== 'all') count++;
    if (this.reservationFilters.timeFilter !== 'all') count++;
    return count;
  }

  getTimeFilterLabel(): string {
    switch (this.reservationFilters.timeFilter) {
      case 'today':
        return 'Today';
      case 'tomorrow':
        return 'Tomorrow';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'custom':
        return 'Custom Range';
      case 'all':
        return 'All Time';
      default:
        return 'All Time';
    }
  }
}
