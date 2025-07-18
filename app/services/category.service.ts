import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category } from '../models/product/category.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly API_URL = 'http://localhost:8081/api/categories';

  private http = inject(HttpClient);

  constructor() {}

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.API_URL);
  }
}
