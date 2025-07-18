import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { type Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import type { OrderDTO, CreateOrderRequest } from '../models/order/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = 'http://localhost:8081/api/orders';

  private httpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private http = inject(HttpClient);

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(
      () => new Error('Something bad happened; please try again later.')
    );
  }

  createOrder(orderRequest: CreateOrderRequest): Observable<OrderDTO> {
    return this.http
      .post<OrderDTO>(this.apiUrl, orderRequest, { headers: this.httpHeaders })
      .pipe(catchError(this.handleError));
  }

  getOrderById(id: number): Observable<OrderDTO> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<OrderDTO>(url).pipe(catchError(this.handleError));
  }

  getAllOrders(): Observable<OrderDTO[]> {
    return this.http
      .get<OrderDTO[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  updateOrder(id: number, orderDTO: OrderDTO): Observable<OrderDTO> {
    const url = `${this.apiUrl}/${id}`;
    return this.http
      .put<OrderDTO>(url, orderDTO, { headers: this.httpHeaders })
      .pipe(catchError(this.handleError));
  }

  deleteOrder(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url).pipe(catchError(this.handleError));
  }
}
