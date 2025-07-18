// src/app/services/review.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ReviewResponse,
  PaginatedResponse,
  ReviewRequest,
} from '../models/review/review.model';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  // Folosim inject() modern pentru a injecta HttpClient
  private http = inject(HttpClient);

  // URL-ul API-ului nostru Spring Boot
  private readonly apiUrl = 'http://localhost:8084/api/reviews';

  /**
   * Metoda pentru a obtine o lista paginata de review-uri.
   * @param page - Numarul paginii (incepand de la 0)
   * @param size - Numarul de elemente pe pagina
   * @param sort - Campul dupa care se sorteaza (ex: 'rating,desc')
   */
  getReviews(
    page: number,
    size: number,
    sort: string
  ): Observable<PaginatedResponse<ReviewResponse>> {
    // Construim parametrii HTTP intr-un mod sigur
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<PaginatedResponse<ReviewResponse>>(this.apiUrl, {
      params,
    });
  }

  /**
   * Metoda pentru a crea un review nou.
   * @param reviewData - Datele pentru noul review
   */
  createReview(reviewData: ReviewRequest): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(this.apiUrl, reviewData);
  }
}
