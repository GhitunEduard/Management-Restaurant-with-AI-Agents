import { Component, inject, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { Product } from '../../models/product/product.model';
import type { Category } from '../../models/product/category.model';
import type { Ingredient } from '../../models/product/ingredient.model';
import { ProductManagementService } from '../../services/product-management.service';

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface FilterOptions {
  searchTerm: string;
  categoryId: number;
  minPrice: number;
  maxPrice: number;
  sortBy: 'name' | 'price' | 'category';
  sortOrder: 'asc' | 'desc';
}

interface PaginationOptions {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

type ViewMode = 'products' | 'categories' | 'ingredients';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.css'],
})
export class ProductManagementComponent implements OnInit {
  // Make Math and Number available in template
  Math = Math;
  Number = Number;

  // View management
  currentView: ViewMode = 'products';

  // Modal states
  showProductModal = false;
  showCategoryModal = false;
  showIngredientModal = false;
  showDeleteConfirmModal = false;

  // Edit mode flags
  isEditingProduct = false;
  isEditingCategory = false;
  isEditingIngredient = false;

  // Current editing IDs
  editingProductId?: number;
  editingCategoryId?: number;
  editingIngredientId?: number;

  // Delete confirmation
  deleteItem: {
    type: 'product' | 'category' | 'ingredient';
    id: number;
    name: string;
  } | null = null;

  // Form objects
  newProduct: Product = {
    name: '',
    description: '',
    price: 0,
    categoryId: 0,
    ingredientIds: [],
    imageUrl: undefined, // Adăugat imageUrl la newProduct
  };

  newCategory: Category = {
    name: '',
    description: '',
  };

  newIngredient: Ingredient = {
    name: '',
  };

  // Notification system
  notifications: Notification[] = [];
  private notificationIdCounter = 1;

  // Data arrays
  ingredients: Ingredient[] = [];
  categories: Category[] = [];
  products: Product[] = [];
  selectedIngredients: number[] = [];

  // ============== START MODIFICARE IMAGINE ==============
  selectedImageFile: File | null = null;
  currentProductImageUrl: string | undefined; // Pentru a afișa imaginea existentă și previzualizarea
  // =============== END MODIFICARE IMAGINE ===============

  // Filtered and paginated data
  filteredProducts: Product[] = [];
  filteredCategories: Category[] = [];
  filteredIngredients: Ingredient[] = [];
  paginatedProducts: Product[] = [];
  paginatedCategories: Category[] = [];
  paginatedIngredients: Ingredient[] = []; // Fixed type

  // Filter options
  filters: FilterOptions = {
    searchTerm: '',
    categoryId: 0,
    minPrice: 0,
    maxPrice: 0, // Changed from 1000 to 0 to represent "no limit"
    sortBy: 'name',
    sortOrder: 'asc',
  };

  // Pagination options
  productPagination: PaginationOptions = {
    currentPage: 1,
    itemsPerPage: 12,
    totalItems: 0,
    totalPages: 0,
  };

  categoryPagination: PaginationOptions = {
    currentPage: 1,
    itemsPerPage: 16,
    totalItems: 0,
    totalPages: 0,
  };

  ingredientPagination: PaginationOptions = {
    currentPage: 1,
    itemsPerPage: 24,
    totalItems: 0,
    totalPages: 0,
  };

  // Items per page options
  itemsPerPageOptions = [8, 12, 16, 24, 32];

  private productService = inject(ProductManagementService);

  ngOnInit(): void {
    this.loadIngredients();
    this.loadCategories();
    this.loadProducts();
  }

  // View Management
  switchView(view: ViewMode) {
    this.currentView = view;
    this.resetFilters();
  }

  // Filter Management
  applyFilters() {
    switch (this.currentView) {
      case 'products':
        this.filterProducts();
        break;
      case 'categories':
        this.filterCategories();
        break;
      case 'ingredients':
        this.filterIngredients();
        break;
    }
  }

  resetFilters() {
    this.filters = {
      searchTerm: '',
      categoryId: 0,
      minPrice: 0,
      maxPrice: 0, // Changed from 1000 to 0 to represent "no limit"
      sortBy: 'name',
      sortOrder: 'asc',
    };
    this.applyFilters();
  }

  filterProducts() {
    let filtered = [...this.products];

    // Search filter
    if (this.filters.searchTerm) {
      const searchTerm = this.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Category filter - convert to number and check for valid selection
    if (this.filters.categoryId && Number(this.filters.categoryId) > 0) {
      const categoryId = Number(this.filters.categoryId);
      filtered = filtered.filter(
        (product) => product.categoryId === categoryId
      );
    }

    // Price range filter with proper null/empty handling
    const minPrice = Number(this.filters.minPrice) || 0;
    const maxPrice =
      this.filters.maxPrice && Number(this.filters.maxPrice) > 0
        ? Number(this.filters.maxPrice)
        : Number.MAX_SAFE_INTEGER;

    filtered = filtered.filter(
      (product) => product.price >= minPrice && product.price <= maxPrice
    );

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (this.filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'category':
          const categoryA = this.getCategoryName(a.categoryId);
          const categoryB = this.getCategoryName(b.categoryId);
          comparison = categoryA.localeCompare(categoryB);
          break;
      }
      return this.filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    this.filteredProducts = filtered;
    this.productPagination.totalItems = filtered.length;
    this.productPagination.totalPages = Math.ceil(
      filtered.length / this.productPagination.itemsPerPage
    );
    this.productPagination.currentPage = 1;
    this.updatePaginatedProducts();
  }

  filterCategories() {
    let filtered = [...this.categories];

    if (this.filters.searchTerm) {
      const searchTerm = this.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (category) =>
          category.name.toLowerCase().includes(searchTerm) ||
          category.description?.toLowerCase().includes(searchTerm)
      );
    }

    filtered.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return this.filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    this.filteredCategories = filtered;
    this.categoryPagination.totalItems = filtered.length;
    this.categoryPagination.totalPages = Math.ceil(
      filtered.length / this.categoryPagination.itemsPerPage
    );
    this.categoryPagination.currentPage = 1;
    this.updatePaginatedCategories();
  }

  filterIngredients() {
    let filtered = [...this.ingredients];

    if (this.filters.searchTerm) {
      const searchTerm = this.filters.searchTerm.toLowerCase();
      filtered = filtered.filter((ingredient) =>
        ingredient.name.toLowerCase().includes(searchTerm)
      );
    }

    filtered.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return this.filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    this.filteredIngredients = filtered;
    this.ingredientPagination.totalItems = filtered.length;
    this.ingredientPagination.totalPages = Math.ceil(
      filtered.length / this.ingredientPagination.itemsPerPage
    );
    this.ingredientPagination.currentPage = 1;
    this.updatePaginatedIngredients();
  }

  // Pagination Management
  updatePaginatedProducts() {
    const startIndex =
      (this.productPagination.currentPage - 1) *
      this.productPagination.itemsPerPage;
    const endIndex = startIndex + this.productPagination.itemsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  updatePaginatedCategories() {
    const startIndex =
      (this.categoryPagination.currentPage - 1) *
      this.categoryPagination.itemsPerPage;
    const endIndex = startIndex + this.categoryPagination.itemsPerPage;
    this.paginatedCategories = this.filteredCategories.slice(
      startIndex,
      endIndex
    );
  }

  updatePaginatedIngredients() {
    const startIndex =
      (this.ingredientPagination.currentPage - 1) *
      this.ingredientPagination.itemsPerPage;
    const endIndex = startIndex + this.ingredientPagination.itemsPerPage;
    this.paginatedIngredients = this.filteredIngredients.slice(
      startIndex,
      endIndex
    ); // Fixed assignment
  }

  goToPage(page: number, type: 'products' | 'categories' | 'ingredients') {
    switch (type) {
      case 'products':
        this.productPagination.currentPage = page;
        this.updatePaginatedProducts();
        break;
      case 'categories':
        this.categoryPagination.currentPage = page;
        this.updatePaginatedCategories();
        break;
      case 'ingredients':
        this.ingredientPagination.currentPage = page;
        this.updatePaginatedIngredients();
        break;
    }
  }

  changeItemsPerPage(
    itemsPerPage: number,
    type: 'products' | 'categories' | 'ingredients'
  ) {
    switch (type) {
      case 'products':
        this.productPagination.itemsPerPage = itemsPerPage;
        this.productPagination.totalPages = Math.ceil(
          this.filteredProducts.length / itemsPerPage
        );
        this.productPagination.currentPage = 1;
        this.updatePaginatedProducts();
        break;
      case 'categories':
        this.categoryPagination.itemsPerPage = itemsPerPage;
        this.categoryPagination.totalPages = Math.ceil(
          this.filteredCategories.length / itemsPerPage
        );
        this.categoryPagination.currentPage = 1;
        this.updatePaginatedCategories();
        break;
      case 'ingredients':
        this.ingredientPagination.itemsPerPage = itemsPerPage;
        this.ingredientPagination.totalPages = Math.ceil(
          this.filteredIngredients.length / itemsPerPage
        );
        this.ingredientPagination.currentPage = 1;
        this.updatePaginatedIngredients();
        break;
    }
  }

  getPageNumbers(pagination: PaginationOptions): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const totalPages = pagination.totalPages;
    const currentPage = pagination.currentPage;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(
        1,
        currentPage - Math.floor(maxVisiblePages / 2)
      );
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  getCurrentPagination(): PaginationOptions {
    switch (this.currentView) {
      case 'products':
        return this.productPagination;
      case 'categories':
        return this.categoryPagination;
      case 'ingredients':
        return this.ingredientPagination;
    }
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

  // Delete Confirmation Methods
  confirmDelete(
    type: 'product' | 'category' | 'ingredient',
    id: number,
    name: string
  ) {
    this.deleteItem = { type, id, name };
    this.showDeleteConfirmModal = true;
  }

  cancelDelete() {
    this.deleteItem = null;
    this.showDeleteConfirmModal = false;
  }

  executeDelete() {
    if (!this.deleteItem) return;

    const { type, id, name } = this.deleteItem;

    switch (type) {
      case 'product':
        this.productService.deleteProduct(id).subscribe({
          next: () => {
            this.products = this.products.filter((p) => p.id !== id);
            this.applyFilters();
            this.showNotification(`Product "${name}" deleted successfully!`);
          },
          error: (err) => {
            console.error('Error deleting product', err);
            this.showNotification('Failed to delete product', 'error');
          },
        });
        break;
      case 'category':
        this.productService.deleteCategory(id).subscribe({
          next: () => {
            this.categories = this.categories.filter((c) => c.id !== id);
            this.applyFilters();
            this.showNotification(`Category "${name}" deleted successfully!`);
          },
          error: (err) => {
            console.error('Error deleting category', err);
            this.showNotification('Failed to delete category', 'error');
          },
        });
        break;
      case 'ingredient':
        this.productService.deleteIngredient(id).subscribe({
          next: () => {
            this.ingredients = this.ingredients.filter((i) => i.id !== id);
            this.applyFilters();
            this.showNotification(`Ingredient "${name}" deleted successfully!`);
          },
          error: (err) => {
            console.error('Error deleting ingredient', err);
            this.showNotification('Failed to delete ingredient', 'error');
          },
        });
        break;
    }

    this.cancelDelete();
  }

  // Ingredient Methods
  loadIngredients() {
    this.productService.getIngredients().subscribe({
      next: (data) => {
        this.ingredients = data;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading ingredients', err);
        this.showNotification('Failed to load ingredients', 'error');
      },
    });
  }

  openIngredientModal(ingredient?: Ingredient) {
    this.showIngredientModal = true;
    if (ingredient) {
      this.isEditingIngredient = true;
      this.editingIngredientId = ingredient.id;
      this.newIngredient = { ...ingredient };
    } else {
      this.resetIngredientForm();
    }
  }

  closeIngredientModal() {
    this.showIngredientModal = false;
    this.resetIngredientForm();
  }

  resetIngredientForm() {
    this.newIngredient = { name: '' };
    this.isEditingIngredient = false;
    this.editingIngredientId = undefined;
  }

  saveIngredient() {
    if (this.newIngredient.name) {
      if (this.isEditingIngredient && this.editingIngredientId) {
        this.productService
          .updateIngredient(this.editingIngredientId, this.newIngredient)
          .subscribe({
            next: (updated) => {
              const index = this.ingredients.findIndex(
                (i) => i.id === this.editingIngredientId
              );
              if (index !== -1) {
                this.ingredients[index] = updated;
              }
              this.closeIngredientModal();
              this.applyFilters();
              this.showNotification('Ingredient updated successfully!');
            },
            error: (err) => {
              console.error('Error updating ingredient', err);
              this.showNotification('Failed to update ingredient', 'error');
            },
          });
      } else {
        this.productService.addIngredient(this.newIngredient).subscribe({
          next: (created) => {
            this.ingredients.push(created);
            this.closeIngredientModal();
            this.applyFilters();
            this.showNotification('Ingredient added successfully!');
          },
          error: (err) => {
            console.error('Error saving ingredient', err);
            this.showNotification('Failed to save ingredient', 'error');
          },
        });
      }
    }
  }

  // Category Methods
  loadCategories() {
    this.productService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading categories', err);
        this.showNotification('Failed to load categories', 'error');
      },
    });
  }

  openCategoryModal(category?: Category) {
    this.showCategoryModal = true;
    if (category) {
      this.isEditingCategory = true;
      this.editingCategoryId = category.id;
      this.newCategory = { ...category };
    } else {
      this.resetCategoryForm();
    }
  }

  closeCategoryModal() {
    this.showCategoryModal = false;
    this.resetCategoryForm();
  }

  resetCategoryForm() {
    this.newCategory = { name: '', description: '' };
    this.isEditingCategory = false;
    this.editingCategoryId = undefined;
  }

  saveCategory() {
    if (this.newCategory.name) {
      if (this.isEditingCategory && this.editingCategoryId) {
        this.productService
          .updateCategory(this.editingCategoryId, this.newCategory)
          .subscribe({
            next: (updated) => {
              const index = this.categories.findIndex(
                (c) => c.id === this.editingCategoryId
              );
              if (index !== -1) {
                this.categories[index] = updated;
              }
              this.closeCategoryModal();
              this.applyFilters();
              this.showNotification('Category updated successfully!');
            },
            error: (err) => {
              console.error('Error updating category', err);
              this.showNotification('Failed to update category', 'error');
            },
          });
      } else {
        this.productService.addCategory(this.newCategory).subscribe({
          next: (created) => {
            this.categories.push(created);
            this.closeCategoryModal();
            this.applyFilters();
            this.showNotification('Category added successfully!');
          },
          error: (err) => {
            console.error('Error saving category', err);
            this.showNotification('Failed to save category', 'error');
          },
        });
      }
    }
  }

  // Product Methods
  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.showNotification('Failed to load products', 'error');
      },
    });
  }

  openProductModal(product?: Product) {
    this.showProductModal = true;
    if (product) {
      this.isEditingProduct = true;
      this.editingProductId = product.id;
      this.newProduct = { ...product };
      this.selectedIngredients = [...product.ingredientIds];
      this.currentProductImageUrl = product.imageUrl; // Set the current image URL for display
    } else {
      this.resetProductForm();
    }
  }

  closeProductModal() {
    this.showProductModal = false;
    this.resetProductForm();
  }

  resetProductForm() {
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      categoryId: 0,
      ingredientIds: [],
      imageUrl: undefined, // Reset imageUrl
    };
    this.selectedIngredients = [];
    this.isEditingProduct = false;
    this.editingProductId = undefined;
    this.selectedImageFile = null; // Clear selected file
    this.currentProductImageUrl = undefined; // Clear image preview
  }

  saveProduct() {
    if (
      this.newProduct.name &&
      this.newProduct.price > 0 &&
      this.newProduct.categoryId > 0
    ) {
      const product: Product = {
        ...this.newProduct,
        ingredientIds: [...this.selectedIngredients],
        // imageUrl is handled separately, not directly from form via newProduct
      };

      if (this.isEditingProduct && this.editingProductId) {
        this.productService
          .updateProduct(this.editingProductId, product)
          .subscribe({
            next: (updated) => {
              const index = this.products.findIndex(
                (p) => p.id === this.editingProductId
              );
              if (index !== -1) {
                this.products[index] = updated;
              }
              // Don't close modal here, allow image upload after product save
              // this.closeProductModal();
              this.applyFilters();
              this.showNotification('Product updated successfully!');

              // If an image file is selected, upload it
              if (this.selectedImageFile && this.editingProductId) {
                this.uploadImageForProduct(
                  this.editingProductId,
                  this.selectedImageFile
                );
              } else {
                this.closeProductModal(); // Close if no image upload is pending
              }
            },
            error: (err) => {
              console.error('Error updating product', err);
              this.showNotification('Failed to update product', 'error');
            },
          });
      } else {
        this.productService.addProduct(product).subscribe({
          next: (created) => {
            this.products.push(created);
            // After creation, if an image is selected, upload it using the new product's ID
            if (this.selectedImageFile && created.id) {
              this.editingProductId = created.id; // Set for potential further image actions
              this.uploadImageForProduct(created.id, this.selectedImageFile);
            } else {
              this.closeProductModal(); // Close if no image upload is pending
            }
            this.applyFilters();
            this.showNotification('Product added successfully!');
          },
          error: (err) => {
            console.error('Error saving product', err);
            this.showNotification('Failed to save product', 'error');
          },
        });
      }
    }
  }

  // ============== START MODIFICARE IMAGINE ==============
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImageFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentProductImageUrl = e.target.result; // Previzualizare imagine
      };
      reader.readAsDataURL(this.selectedImageFile);
    } else {
      this.selectedImageFile = null;
      // If no file selected, and there's an existing image, keep it
      if (this.newProduct.imageUrl) {
        this.currentProductImageUrl = this.newProduct.imageUrl;
      } else {
        this.currentProductImageUrl = undefined;
      }
    }
  }

  uploadImageForProduct(productId: number, file: File): void {
    this.productService.uploadProductImage(productId, file).subscribe({
      next: (updatedProduct) => {
        // Update the product in the local array with the new imageUrl
        const index = this.products.findIndex(
          (p) => p.id === updatedProduct.id
        );
        if (index !== -1) {
          this.products[index].imageUrl = updatedProduct.imageUrl;
        }
        this.currentProductImageUrl = updatedProduct.imageUrl; // Update preview to actual saved URL
        this.selectedImageFile = null; // Clear selected file after successful upload
        this.applyFilters(); // Re-apply filters to refresh data if necessary
        this.showNotification('Product image uploaded successfully!');
        this.closeProductModal(); // Close modal after image upload
      },
      error: (err) => {
        console.error('Error uploading image', err);
        this.showNotification('Failed to upload image', 'error');
        // Handle error: maybe clear selected file or show an error state
      },
    });
  }

  deleteImageForProduct(productId: number): void {
    this.productService.deleteProductImage(productId).subscribe({
      next: () => {
        // Find the product and clear its imageUrl
        const index = this.products.findIndex((p) => p.id === productId);
        if (index !== -1) {
          this.products[index].imageUrl = undefined;
        }
        this.currentProductImageUrl = undefined; // Clear the preview
        this.showNotification('Product image deleted successfully!');
        // No need to close modal, user might want to upload a new one
      },
      error: (err) => {
        console.error('Error deleting image', err);
        this.showNotification('Failed to delete image', 'error');
      },
    });
  }

  // Helper to construct full image URL (assuming your backend serves static files)
  getFullImageUrl(fileName: string | undefined): string {
    if (fileName) {
      // Aceasta trebuie să se potrivească cu ce ai configurat în backend Spring Boot
      // Unde "http://localhost:8081" este URL-ul microserviciului tău
      // Și "/uploads/product-images/" este mapping-ul resurselor statice
      return `http://localhost:8081/uploads/product-images/${fileName}`;
    }
    // Poți returna un URL pentru o imagine placeholder dacă nu există imagine
    return 'assets/placeholder-image.png'; // Asigură-te că ai o imagine placeholder
  }
  // =============== END MODIFICARE IMAGINE ===============

  // Helper Methods
  toggleIngredient(ingredientId: number) {
    const index = this.selectedIngredients.indexOf(ingredientId);
    if (index > -1) {
      this.selectedIngredients.splice(index, 1);
    } else {
      this.selectedIngredients.push(ingredientId);
    }
    this.newProduct.ingredientIds = [...this.selectedIngredients];
  }

  isIngredientSelected(ingredientId: number): boolean {
    return this.selectedIngredients.includes(ingredientId);
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find((cat) => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  getIngredientName(ingredientId: number): string {
    const ingredient = this.ingredients.find((ing) => ing.id === ingredientId);
    return ingredient ? ingredient.name : 'Unknown';
  }

  getIngredientNames(ingredientIds: number[]): string {
    const names = ingredientIds.map((id) => {
      const ingredient = this.ingredients.find((ing) => ing.id === id);
      return ingredient ? ingredient.name : 'Unknown';
    });
    return names.join(', ');
  }

  getModalTitle(type: 'product' | 'category' | 'ingredient'): string {
    switch (type) {
      case 'product':
        return this.isEditingProduct ? 'Edit Product' : 'Add New Product';
      case 'category':
        return this.isEditingCategory ? 'Edit Category' : 'Add New Category';
      case 'ingredient':
        return this.isEditingIngredient
          ? 'Edit Ingredient'
          : 'Add New Ingredient';
    }
  }

  getSaveButtonText(type: 'product' | 'category' | 'ingredient'): string {
    switch (type) {
      case 'product':
        return this.isEditingProduct ? 'Update Product' : 'Save Product';
      case 'category':
        return this.isEditingCategory ? 'Update Category' : 'Save Category';
      case 'ingredient':
        return this.isEditingIngredient
          ? 'Update Ingredient'
          : 'Save Ingredient';
    }
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.filters.searchTerm) count++;
    if (this.filters.categoryId && Number(this.filters.categoryId) > 0) count++;
    if (
      Number(this.filters.minPrice) > 0 ||
      (this.filters.maxPrice && Number(this.filters.maxPrice) > 0)
    )
      count++;
    return count;
  }
}
