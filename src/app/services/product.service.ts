import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product/product.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly API_URL = 'http://localhost:8081/api/products';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.API_URL);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/${id}`);
  }

  create(product: Product): Observable<Product> {
    return this.http.post<Product>(this.API_URL, product);
  }

  update(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.API_URL}/${id}`, product);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  // ============== START MODIFICARE ==============
  uploadImage(productId: number, file: File): Observable<Product> {
    const formData = new FormData();
    formData.append('imageFile', file); // 'imageFile' trebuie să corespundă cu @RequestPart din Spring Boot

    // Adăugăm un header Content-Type 'multipart/form-data' explicit, deși HttpClient ar trebui să-l seteze automat
    // cu boundary-ul corect când folosești FormData.
    // Totuși, îl menținem aici pentru claritate, dar nu este strict necesar să-l setăm manual.
    // Bearer token-ul ar trebui adăugat printr-un interceptor, nu direct aici.
    // Presupunem că un HttpInterceptor gestionează adăugarea token-ului de autorizare.

    return this.http.post<Product>(
      `${this.API_URL}/${productId}/image`,
      formData
    );
  }

  deleteImage(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${productId}/image`);
  }
  // =============== END MODIFICARE ===============
}
