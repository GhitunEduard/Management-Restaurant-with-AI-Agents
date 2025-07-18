// src/app/models/reservation/user-reservation-request.model.ts
export interface UserReservationRequest {
  customerName: string;
  phoneNumber: string;
  // Formatul va fi "YYYY-MM-DDTHH:mm:ss" pentru LocalDateTime
  reservationDateTime: string;
  numberOfPeople: number;
}
