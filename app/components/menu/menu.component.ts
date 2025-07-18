import { Component, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import {
  MenuService,
  MenuItem,
  MenuCategory,
} from '../../services/menu.service'; // Asigură-te că ai calea corectă

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent implements OnInit {
  searchTerm = '';
  selectedCategory = 'all';

  // Restaurant contact information - rămâne la fel
  restaurantPhone = '+40 264 123 456';
  restaurantWhatsApp = '+40 264 123 456';

  // Aceste array-uri vor fi populate din serviciu
  categories: MenuCategory[] = [];
  menuItems: MenuItem[] = [];
  filteredItems: MenuItem[] = [];

  isLoading = true; // Flag pentru a afișa un indicator de încărcare (opțional)

  // Injectăm noul MenuService
  constructor(private menuService: MenuService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.menuService.getMenuData().subscribe({
      next: ({ menuItems, categories }) => {
        this.menuItems = menuItems;
        this.categories = categories;

        // Odată ce avem datele, executăm logica inițială
        this.updateCategoryCounts();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load menu data', err);
        // Poți afișa un mesaj de eroare în UI
        this.isLoading = false;
      },
    });
  }

  filterByCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  callRestaurant(): void {
    window.open(`tel:${this.restaurantPhone}`, '_self');
  }

  openWhatsApp(): void {
    const message = encodeURIComponent(
      'Bună ziua! Aș dori să fac o comandă de la Ristorante Bella Vista.'
    );
    window.open(
      `https://wa.me/${this.restaurantWhatsApp.replace(
        /\s+/g,
        ''
      )}?text=${message}`,
      '_blank'
    );
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = this.menuItems;

    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(
        (item) => item.category === this.selectedCategory
      );
    }

    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
      );
    }

    this.filteredItems = filtered;
  }

  private updateCategoryCounts(): void {
    this.categories.forEach((category) => {
      if (category.id === 'all') {
        category.count = this.menuItems.length;
      } else {
        category.count = this.menuItems.filter(
          (item) => item.category === category.id
        ).length;
      }
    });
  }

  trackByCategory(index: number, category: MenuCategory): string {
    return category.id;
  }

  trackByMenuItem(index: number, item: MenuItem): number {
    return item.id;
  }
}
