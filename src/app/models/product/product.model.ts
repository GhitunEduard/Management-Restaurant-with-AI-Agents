export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  ingredientIds: number[];
  imageUrl?: string; // Adăugat câmpul imageUrl, este opțional
}
