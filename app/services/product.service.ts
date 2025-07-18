import { inject, Injectable } from '@angular/core';
import { Product } from '../models/product/product.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly API_URL = 'http://localhost:8081/api/products';

  private http = inject(HttpClient);

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.API_URL);
  }

  // ============== START MODIFICARE ==============
  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/${id}`);
  }
  // =============== END MODIFICARE ===============
}
