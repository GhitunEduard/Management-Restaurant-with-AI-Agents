import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent {
  notifications = [
    {
      id: 1,
      type: 'warning',
      title: 'Low Stock Alert',
      message: 'Tomatoes are running low (5 units remaining)',
      timestamp: '2 minutes ago',
      read: false,
      icon: 'fas fa-exclamation-triangle',
    },
    {
      id: 2,
      type: 'info',
      title: 'New Reservation',
      message: 'John Smith made a reservation for 4 guests on Jan 16, 7:00 PM',
      timestamp: '15 minutes ago',
      read: false,
      icon: 'fas fa-calendar-plus',
    },
    {
      id: 3,
      type: 'success',
      title: 'Order Completed',
      message: 'Table 5 order has been completed and served',
      timestamp: '1 hour ago',
      read: true,
      icon: 'fas fa-check-circle',
    },
    {
      id: 4,
      type: 'error',
      title: 'Payment Failed',
      message: 'Payment processing failed for order #1234',
      timestamp: '2 hours ago',
      read: false,
      icon: 'fas fa-times-circle',
    },
    {
      id: 5,
      type: 'info',
      title: 'Daily Report Ready',
      message: 'Your daily sales report for Jan 14 is ready for download',
      timestamp: '3 hours ago',
      read: true,
      icon: 'fas fa-file-alt',
    },
  ];

  get unreadCount() {
    return this.notifications.filter((n) => !n.read).length;
  }

  markAsRead(notificationId: number) {
    const notification = this.notifications.find(
      (n) => n.id === notificationId
    );
    if (notification) {
      notification.read = true;
    }
  }

  markAllAsRead() {
    this.notifications.forEach((n) => (n.read = true));
  }

  deleteNotification(notificationId: number) {
    this.notifications = this.notifications.filter(
      (n) => n.id !== notificationId
    );
  }

  clearAll() {
    if (confirm('Are you sure you want to clear all notifications?')) {
      this.notifications = [];
    }
  }

  getTypeClass(type: string) {
    const classes = {
      success: 'bg-green-100 text-green-600',
      warning: 'bg-yellow-100 text-yellow-600',
      error: 'bg-red-100 text-red-600',
      info: 'bg-blue-100 text-blue-600',
    };
    return classes[type as keyof typeof classes] || 'bg-gray-100 text-gray-600';
  }
}
