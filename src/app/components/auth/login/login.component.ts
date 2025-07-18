import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../../services/login.service';
import type { LoginRequest } from '../../../models/user/login-request.model';

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  // Login form data
  loginData: LoginRequest = {
    email: '',
    password: '',
  };

  // UI state
  isLoading = false;
  showPassword = false;

  // Navigation configuration
  // These can be moved to environment variables or a configuration service
  private readonly adminDashboardRoute = '/admin/dashboard';
  private readonly employeeDashboardRoute = '/dashboard';
  private readonly redirectDelay = 500; // milliseconds

  // Notification system
  notifications: Notification[] = [];
  private notificationIdCounter = 1;

  // Services using modern inject pattern
  private loginService = inject(LoginService);
  private router = inject(Router);

  // Form validation
  get isFormValid(): boolean {
    return (
      this.loginData.email.trim() !== '' &&
      this.loginData.password.trim() !== '' &&
      this.isValidEmail(this.loginData.email)
    );
  }

  // Email validation
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Handle login with direct navigation
  onLogin(): void {
    if (!this.isFormValid) {
      this.showNotification('Please fill in all fields correctly', 'error');
      return;
    }

    this.isLoading = true;

    this.loginService.login(this.loginData).subscribe({
      next: (response) => {
        // Acum nu mai primim rolul direct, AuthService se ocupă de tot în spate.
        // Trebuie doar să știm că a fost un succes.
        this.showNotification('Login successful! Welcome back.', 'success');

        // Putem naviga direct. Rolul va fi verificat de AuthGuard pe ruta de dashboard.
        setTimeout(() => {
          this.isLoading = false;
          // Navigăm către o rută generică, iar AuthGuard va decide dacă e ok
          // sau va redirecționa către dashboard-ul corect.
          this.router.navigateByUrl('/dashboard');
        }, this.redirectDelay);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);

        // ... logica de eroare existentă rămâne validă ...
        let errorMessage = 'Login failed. Please try again.';
        if (error.status === 401 || error.status === 403) {
          errorMessage = 'Invalid email or password.';
        } else if (error.status === 0) {
          errorMessage = 'Unable to connect to server.';
        }

        this.showNotification(errorMessage, 'error');
      },
    });
  }

  // Navigate to main page with direct route (no query params)
  private navigateToMainPage(route: string): void {
    this.router
      .navigateByUrl(route)
      .then((success) => {
        if (!success) {
          console.warn(
            'Navigation to main page was prevented. Check route guards or configuration.'
          );
          this.showNotification(
            'Navigation to dashboard was unsuccessful. Please try again.',
            'warning'
          );
        }
      })
      .catch((error) => {
        console.error('Navigation error:', error);
        this.showNotification(
          'An error occurred during navigation. Please try again.',
          'error'
        );
      });
  }

  // Reset form
  resetForm(): void {
    this.loginData = {
      email: '',
      password: '',
    };
    this.showPassword = false;
  }

  // Notification methods
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

    // Auto remove after 5 seconds
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, 5000);
  }

  removeNotification(id: number): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
  }

  // Handle Enter key press
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.isFormValid) {
      this.onLogin();
    }
  }
}
