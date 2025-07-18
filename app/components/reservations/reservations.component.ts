// src/app/reservations/reservations.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ReservationService } from '../../services/reservation.service'; // Import NOU
import { UserReservationRequest } from '../../models/reservation/user-reservation-request.model'; // Import NOU

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.css'],
})
export class ReservationsComponent {
  reservationForm: FormGroup;
  isSubmitting = false;
  minDate = new Date();

  timeSlots = [
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '19:00',
    '19:30',
    '20:00',
    '20:30',
    '21:00',
    '21:30',
    '22:00',
  ];

  partySize = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private reservationService: ReservationService // Injectare NOUĂ
  ) {
    this.reservationForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      date: ['', Validators.required],
      time: ['', Validators.required],
      guests: [2, [Validators.required, Validators.min(1), Validators.max(10)]],
      specialRequests: [''],
    });
  }

  onSubmit() {
    if (this.reservationForm.valid) {
      this.isSubmitting = true;

      const formValue = this.reservationForm.value;

      // Formatarea datei și orei pentru a se potrivi cu LocalDateTime din Spring Boot
      const selectedDate: Date = formValue.date;
      const selectedTime: string = formValue.time; // ex: "19:30"

      // Construim string-ul YYYY-MM-DD
      const year = selectedDate.getFullYear();
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      // Combinăm data și ora cu secunde implicite "00"
      const reservationDateTime = `${formattedDate}T${selectedTime}:00`;

      const reservationRequest: UserReservationRequest = {
        customerName: `${formValue.firstName} ${formValue.lastName}`,
        phoneNumber: formValue.phone,
        reservationDateTime: reservationDateTime,
        numberOfPeople: formValue.guests,
        // specialRequests nu este inclus în UserReservationRequestDTO și nu va fi trimis către backend
      };

      this.reservationService
        .createUserReservation(reservationRequest)
        .subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.snackBar.open(
              'Rezervarea a fost trimisă cu succes! Vă vom contacta în curând pentru confirmare.',
              'Închide',
              {
                duration: 5000,
                panelClass: ['success-snackbar'],
              }
            );
            this.reservationForm.reset();
            this.reservationForm.patchValue({ guests: 2 }); // Setează valoarea implicită pentru numărul de oaspeți
          },
          error: (error) => {
            this.isSubmitting = false;
            console.error('Eroare la trimiterea rezervării:', error);
            let errorMessage =
              'A apărut o eroare la trimiterea rezervării. Vă rugăm să încercați din nou.';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }
            this.snackBar.open(errorMessage, 'Închide', {
              duration: 7000,
              panelClass: ['error-snackbar'],
            });
          },
        });
    } else {
      this.markFormGroupTouched();
      this.snackBar.open(
        'Vă rugăm să completați corect toate câmpurile obligatorii.',
        'Închide',
        {
          duration: 5000,
          panelClass: ['error-snackbar'],
        }
      );
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.reservationForm.controls).forEach((key) => {
      const control = this.reservationForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.reservationForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Acest câmp este obligatoriu';
    }
    if (control?.hasError('email')) {
      return 'Introduceți o adresă de email validă';
    }
    if (control?.hasError('minlength')) {
      return 'Prea scurt';
    }
    if (control?.hasError('pattern')) {
      return 'Format invalid';
    }
    if (control?.hasError('min')) {
      return 'Valoare prea mică';
    }
    if (control?.hasError('max')) {
      return 'Valoare prea mare';
    }
    return '';
  }
}
