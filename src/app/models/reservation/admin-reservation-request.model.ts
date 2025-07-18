import { ReservationStatus } from './reservation-status.enum';

export interface AdminReservationRequest {
  customerName: string;
  phoneNumber: string;
  reservationDateTime: string;
  numberOfPeople: number;
  status: ReservationStatus;
}
