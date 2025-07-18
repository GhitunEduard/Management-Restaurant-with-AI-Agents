// src/app/models/review.model.ts

// Interfata pentru datele pe care le trimitem la crearea unui review
export interface ReviewRequest {
  name: string;
  email: string;
  reviewMessage: string;
  rating: number;
}

// Interfata pentru un review primit de la server
export interface ReviewResponse {
  id: number;
  name: string;
  email: string;
  reviewMessage: string;
  rating: number;
  submissionDate: string; // Data va fi primita ca string in format ISO
}

// O interfata generica pentru a gestiona raspunsurile paginate de la Spring
export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // Numarul paginii curente
  first: boolean;
  last: boolean;
  empty: boolean;
}
