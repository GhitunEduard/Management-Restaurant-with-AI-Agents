import { Injectable } from '@angular/core';
import { ReservationService } from './reservation.service';
import { AdminReservationRequest } from '../models/reservation/admin-reservation-request.model';
import { ReservationResponse } from '../models/reservation/reservation-response.model';
import { UpdateReservationStatus } from '../models/reservation/update-reservation-status.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReservationManagementService {
  constructor(private reservationService: ReservationService) {}

  createAdminReservation(
    request: AdminReservationRequest
  ): Observable<ReservationResponse> {
    return this.reservationService.createReservationAsAdmin(request);
  }

  getAllReservations(): Observable<ReservationResponse[]> {
    return this.reservationService.getAllReservations();
  }

  getReservationById(id: number): Observable<ReservationResponse> {
    return this.reservationService.getReservationById(id);
  }

  updateReservationStatus(
    id: number,
    status: UpdateReservationStatus
  ): Observable<void> {
    return this.reservationService.updateReservationStatus(id, status);
  }

  deleteReservation(id: number): Observable<void> {
    return this.reservationService.deleteReservation(id);
  }
}
