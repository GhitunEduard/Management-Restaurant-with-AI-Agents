import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category } from '../models/product/category.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly API_URL = 'http://localhost:8081/api/categories';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.API_URL);
  }

  create(category: Category): Observable<Category> {
    return this.http.post<Category>(this.API_URL, category);
  }

  update(id: number, category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.API_URL}/${id}`, category);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
