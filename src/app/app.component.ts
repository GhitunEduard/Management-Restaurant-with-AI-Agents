import { Component, inject, type OnInit, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { LoginService } from './services/login.service';
// MODIFICAT: Importăm 'User' în loc de 'UserResponse'
import type { User } from './models/user/user.model';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LoginComponent } from './components/auth/login/login.component';
import { AiAssistantComponent } from './components/ai-assistant/ai-assistant.component';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  roles: string[];
  route: string;
}

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp?: Date;
  read?: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [CommonModule, AiAssistantComponent, RouterOutlet],
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  private serverUrl = 'http://localhost:8083'; // Am actualizat portul la cel de auth

  // Authentication state
  isLoggedIn = false;
  // MODIFICAT: Tipul este acum 'User | null'
  currentUser: User | null = null;
  userRole: string | null = null;

  // UI state
  currentView = 'dashboard';
  isDarkMode = false;
  showNotifications = false;

  // Navigation items
  navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      roles: ['ADMIN', 'EMPLOYEE'],
      route: '/dashboard',
    },
    {
      id: 'products',
      label: 'Products',
      icon: 'fas fa-utensils',
      roles: ['ADMIN', 'EMPLOYEE'],
      route: '/products',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: 'fas fa-shopping-cart',
      roles: ['ADMIN', 'EMPLOYEE'],
      route: '/orders',
    },
    {
      id: 'contact', // ID unic
      label: 'Contact Info', // Textul afișat în sidebar
      icon: 'fas fa-address-book', // Iconiță relevantă
      roles: ['ADMIN'], // Doar administratorii pot accesa această pagină
      route: '/contact', // Ruta către noua componentă
    },
    {
      id: 'reservations',
      label: 'Reservations',
      icon: 'fas fa-calendar-alt',
      roles: ['ADMIN', 'EMPLOYEE'],
      route: '/reservations',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'fas fa-chart-bar',
      roles: ['ADMIN'],
      route: '/reports',
    },
    {
      id: 'activity-logs',
      label: 'Activity Logs',
      icon: 'fas fa-history',
      roles: ['ADMIN'],
      route: '/activity-logs',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'fas fa-user',
      roles: ['ADMIN', 'EMPLOYEE'],
      route: '/profile',
    },
  ];

  // Notifications
  notifications: Notification[] = [
    // ... notificările tale ...
  ];

  // Services
  private authService = inject(AuthService);
  private loginService = inject(LoginService);
  private router = inject(Router);
  private isBrowser = false;

  constructor() {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  }

  ngOnInit(): void {
    // Subscribe to authentication state
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.authService.currentUser$.subscribe((user) => {
          // Acum asignarea este corectă: User | null la User | null
          this.currentUser = user;
        });
        this.userRole = this.authService.getCurrentUserRole();
      } else {
        this.currentUser = null;
        this.userRole = null;
      }
    });

    // Set initial view based on current route
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentRoute = this.router.url.split('/')[1] || 'dashboard';
        const navItem = this.navigationItems.find(
          (item) => item.route === `/${currentRoute}`
        );
        if (navItem) {
          this.currentView = navItem.id;
        }
      });

    this.loadThemePreference();
  }

  // Filter navigation items based on user role
  get filteredNavigationItems(): NavigationItem[] {
    if (!this.userRole) {
      return [];
    }
    return this.navigationItems.filter((item) =>
      item.roles.includes(this.userRole as string)
    );
  }

  // Set current view and navigate
  setCurrentView(view: string): void {
    this.currentView = view;
    const navItem = this.navigationItems.find((item) => item.id === view);
    if (navItem) {
      this.router.navigateByUrl(navItem.route);
    }
    this.showNotifications = false;
  }

  // Authentication methods
  logout(): void {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }

  // Theme methods
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    this.saveThemePreference();
  }

  private applyTheme(): void {
    if (this.isBrowser) {
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  private loadThemePreference(): void {
    if (this.isBrowser) {
      const savedTheme = localStorage.getItem('theme');
      this.isDarkMode = savedTheme === 'dark';
      this.applyTheme();
    }
  }

  private saveThemePreference(): void {
    if (this.isBrowser) {
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    }
  }

  // Notification methods
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  removeNotification(id: number): void {
    this.notifications = this.notifications.filter(
      (notification) => notification.id !== id
    );
  }

  /**
   * Constructs the full, absolute URL for the profile image
   */
  getProfileImageUrl(): string {
    if (this.currentUser?.profileImageUrl) {
      if (this.currentUser.profileImageUrl.startsWith('http')) {
        return this.currentUser.profileImageUrl;
      }
      // Am actualizat serverUrl pentru a reflecta portul corect al serviciului de auth
      return `${this.serverUrl}${this.currentUser.profileImageUrl}`;
    }
    // O imagine de placeholder default
    return 'https://i.pravatar.cc/32';
  }
}
