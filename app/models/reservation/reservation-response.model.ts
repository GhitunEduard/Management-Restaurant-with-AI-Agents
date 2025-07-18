// src/app/models/reservation/reservation-response.model.ts (Rămâne neschimbat)
import { ReservationStatus } from './reservation-status.enum';

export interface ReservationResponse {
  id: number;
  customerName: string;
  phoneNumber: string;
  reservationDateTime: string;
  numberOfPeople: number;
  status: ReservationStatus;
}
