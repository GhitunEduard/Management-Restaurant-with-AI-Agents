import { inject, Injectable } from '@angular/core';
import { ProductService } from './product.service';
import { CategoryService } from './category.service';
import { Observable, forkJoin, map } from 'rxjs';
import { Product } from '../models/product/product.model';
import { Category as BackendCategory } from '../models/product/category.model';

// Definim interfețele de care are nevoie componenta de UI.
// Este o practică bună să le avem aici sau într-un fișier dedicat de modele pentru UI.
export interface MenuItem {
  id: number;
  name: string;
  // nameItalian: string; // Eliminăm, sau ar trebui să vină de la backend dacă e necesar
  description: string;
  price: number;
  category: string; // Acesta va fi un ID string, ex: 'antipasti'
  image: string; // Acum va folosi imageUrl real de la backend
  isVegetarian?: boolean;
  isSpicy?: boolean;
  isPopular?: boolean;
}

export interface MenuCategory {
  id: string; // ex: 'antipasti'
  name: string; // ex: 'Aperitive'
  icon: string; // Iconița asociată
  count: number;
}

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  // O mapare de la numele categoriei din backend la iconița dorită în frontend
  private categoryIconMap: { [key: string]: string } = {
    Aperitive: 'local_dining',
    'Felul Întâi': 'ramen_dining',
    'Felul Principal': 'lunch_dining',
    Deserturi: 'cake',
    Băuturi: 'local_bar',
  };

  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  // Adăugăm URL-ul de bază pentru imaginile servite de backend
  private readonly IMAGES_BASE_URL =
    'http://localhost:8081/uploads/product-images/'; // Asigură-te că acesta este corect

  constructor() {}

  /**
   * Preia produsele și categoriile din backend și le transformă în
   * modelele de date necesare pentru componenta Meniu.
   */
  public getMenuData(): Observable<{
    menuItems: MenuItem[];
    categories: MenuCategory[];
  }> {
    // Folosim forkJoin pentru a rula apelurile API în paralel și a aștepta ambele rezultate
    return forkJoin({
      products: this.productService.getAll(),
      categories: this.categoryService.getAll(),
    }).pipe(
      map(({ products, categories }) => {
        // Transformăm categoriile din backend în formatul pentru UI
        const menuCategories = this.transformCategories(categories);

        // Transformăm produsele din backend în formatul MenuItem
        const menuItems = this.transformProducts(products, categories);

        return { menuItems, categories: menuCategories };
      })
    );
  }

  private transformCategories(
    backendCategories: BackendCategory[]
  ): MenuCategory[] {
    // Creăm categoria "Toate" manual
    const allCategory: MenuCategory = {
      id: 'all',
      name: 'Toate',
      icon: 'restaurant',
      count: 0, // Va fi calculat mai târziu în componentă
    };

    const transformed = backendCategories.map((cat) => ({
      id: this.generateCategorySlug(cat.name), // ex: 'Felul Principal' -> 'felul-principal'
      name: cat.name,
      icon: this.categoryIconMap[cat.name] || 'circle', // Folosim maparea sau o iconiță default
      count: 0, // Va fi calculat mai târziu în componentă
    }));

    return [allCategory, ...transformed];
  }

  private transformProducts(
    products: Product[],
    categories: BackendCategory[]
  ): MenuItem[] {
    return products.map((product) => {
      const category = categories.find((c) => c.id === product.categoryId);

      // Backend-ul acum furnizează imageUrl
      const imageUrl = product.imageUrl
        ? `${this.IMAGES_BASE_URL}${product.imageUrl}`
        : '/assets/placeholder.svg'; // Folosim un placeholder dacă nu există imagine.

      return {
        id: product.id!,
        name: product.name,
        // nameItalian: `${product.name} (Italiano)`, // Păstrăm ca exemplu, dar ideal ar trebui să vină de la backend
        nameItalian: product.name, // Sau elimină dacă nu este necesar
        description: product.description,
        price: product.price,
        // Găsim categoria pe baza ID-ului și generăm slug-ul
        category: category
          ? this.generateCategorySlug(category.name)
          : 'uncategorized',

        image: imageUrl, // Acum folosim URL-ul real al imaginii
        isPopular: Math.random() > 0.7, // Simulare pentru un efect vizual
        isVegetarian:
          product.name.toLowerCase().includes('salat') ||
          product.description?.toLowerCase().includes('vegetarian') ||
          false, // Simulare simplă, adăugăm `|| false` pentru siguranță
        isSpicy: product.description?.toLowerCase().includes('picant') || false, // Simulare simplă, adăugăm `|| false` pentru siguranță
      };
    });
  }

  /**
   * Generează un ID prietenos (slug) dintr-un string.
   * ex: "Felul Principal" => "felul-principal"
   */
  private generateCategorySlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-') // Înlocuiește spațiile cu -
      .replace(/[ăâ]/g, 'a') // Diacritice
      .replace(/[ș]/g, 's')
      .replace(/[ț]/g, 't')
      .replace(/[î]/g, 'i');
  }
}
