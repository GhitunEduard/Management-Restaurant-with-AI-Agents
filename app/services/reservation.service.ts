// src/app/services/reservation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReservationResponse } from '../models/reservation/reservation-response.model';
import { UserReservationRequest } from '../models/reservation/user-reservation-request.model'; // Import NOU

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  // Asigură-te că aceasta corespunde adresei microserviciului tău Java
  private baseUrl = 'http://localhost:8080/api/reservations';

  constructor(private http: HttpClient) {}

  // Metoda pentru a crea o rezervare ca utilizator (fără autentificare)
  createUserReservation(
    request: UserReservationRequest
  ): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(
      `${this.baseUrl}/user`, // Endpoint-ul dedicat utilizatorilor
      request
    );
  }

  // Păstrăm metodele GET, pot fi utile pentru vizualizare ulterioară sau o secțiune "Verifică Rezervarea"
  // Deși în contextul actual "fără autentificare" nu sunt strict necesare, pot fi folosite pentru a prelua o singură rezervare dacă utilizatorul are ID-ul.
  // Dacă nu dorești deloc afișarea rezervărilor în client, le putem șterge și pe acestea.
  getAllReservations(): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(this.baseUrl);
  }

  getReservationById(id: number): Observable<ReservationResponse> {
    return this.http.get<ReservationResponse>(`${this.baseUrl}/${id}`);
  }

  // Metodele specifice adminului sunt eliminate din acest serviciu pentru aplicația de client:
  // createReservationAsAdmin
  // updateReservationStatus
  // deleteReservation
}
