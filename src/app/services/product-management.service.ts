import { Injectable, inject } from '@angular/core';
import { IngredientService } from './ingredient.service';
import { Observable } from 'rxjs';
import { Ingredient } from '../models/product/ingredient.model';
import { ProductService } from './product.service';
import { CategoryService } from './category.service';
import { Product } from '../models/product/product.model';
import { Category } from '../models/product/category.model';

@Injectable({
  providedIn: 'root',
})
export class ProductManagementService {
  private ingredientService = inject(IngredientService);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  // Ingredients
  getIngredients(): Observable<Ingredient[]> {
    return this.ingredientService.getAll();
  }

  addIngredient(ingredient: Ingredient): Observable<Ingredient> {
    return this.ingredientService.create(ingredient);
  }

  deleteIngredient(id: number): Observable<void> {
    return this.ingredientService.delete(id);
  }

  updateIngredient(id: number, ingredient: Ingredient): Observable<Ingredient> {
    return this.ingredientService.update(id, ingredient);
  }

  // Products
  getProducts(): Observable<Product[]> {
    return this.productService.getAll();
  }

  addProduct(product: Product): Observable<Product> {
    return this.productService.create(product);
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.productService.update(id, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.productService.delete(id);
  }

  // ============== START MODIFICARE ==============
  uploadProductImage(productId: number, file: File): Observable<Product> {
    return this.productService.uploadImage(productId, file);
  }

  deleteProductImage(productId: number): Observable<void> {
    return this.productService.deleteImage(productId);
  }
  // =============== END MODIFICARE ===============

  // Categories
  getCategories(): Observable<Category[]> {
    return this.categoryService.getAll();
  }

  addCategory(category: Category): Observable<Category> {
    return this.categoryService.create(category);
  }

  updateCategory(id: number, category: Category): Observable<Category> {
    return this.categoryService.update(id, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.categoryService.delete(id);
  }
}
