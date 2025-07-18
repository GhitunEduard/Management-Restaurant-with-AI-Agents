import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AdminReservationRequest } from '../models/reservation/admin-reservation-request.model';
import { ReservationResponse } from '../models/reservation/reservation-response.model';
import { UpdateReservationStatus } from '../models/reservation/update-reservation-status.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private baseUrl = 'http://localhost:8080/api/reservations';

  constructor(private http: HttpClient) {}

  // Create reservation as admin
  createReservationAsAdmin(
    request: AdminReservationRequest
  ): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(
      `${this.baseUrl}/admin`,
      request
    );
  }

  // Get all reservations
  getAllReservations(): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(this.baseUrl);
  }

  // Get reservation by ID
  getReservationById(id: number): Observable<ReservationResponse> {
    return this.http.get<ReservationResponse>(`${this.baseUrl}/${id}`);
  }

  // Update status of reservation
  updateReservationStatus(
    id: number,
    status: UpdateReservationStatus
  ): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/status`, status);
  }

  // Delete reservation
  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
