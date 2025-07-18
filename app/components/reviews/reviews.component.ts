// reviews.component.ts

import { Component, OnInit, inject } from '@angular/core';
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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { ReviewService } from '../../services/review.service';
import {
  PaginatedResponse,
  ReviewRequest,
  ReviewResponse,
} from '../../models/review/review.model';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css'],
})
export class ReviewsComponent implements OnInit {
  reviewForm: FormGroup;
  isSubmitting = false;
  selectedRating = 0;

  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private reviewService = inject(ReviewService);

  pagedReviews: PaginatedResponse<ReviewResponse> | null = null;
  currentPage = 0;
  readonly pageSize = 5;

  constructor() {
    this.reviewForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      reviewMessage: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    const sort = 'submissionDate,desc';
    this.reviewService
      .getReviews(this.currentPage, this.pageSize, sort)
      .subscribe((response) => {
        this.pagedReviews = response;
      });
  }

  setRating(rating: number): void {
    this.selectedRating = rating;
  }

  // --- MODIFICARE: Metoda getStars este acum mai generala ---
  // Accepta un total de stele pentru a fi flexibila.
  getStars(filledCount: number, totalStars: number = 10): boolean[] {
    // Ne asiguram ca numarul de stele pline nu depaseste totalul
    const count = Math.min(Math.max(filledCount, 0), totalStars);
    return Array(count).fill(true);
  }

  getEmptyStars(filledCount: number, totalStars: number = 10): boolean[] {
    const count = totalStars - Math.min(Math.max(filledCount, 0), totalStars);
    return Array(count).fill(true);
  }

  onSubmit(): void {
    if (this.reviewForm.invalid) {
      this.markFormGroupTouched();
      return;
    }
    if (this.selectedRating === 0) {
      this.snackBar.open('Te rugăm să selectezi o evaluare', 'Închide', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    this.isSubmitting = true;
    const reviewRequest: ReviewRequest = {
      ...this.reviewForm.value,
      rating: this.selectedRating,
    };

    this.reviewService.createReview(reviewRequest).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.snackBar.open('Recenzia a fost trimisă cu succes!', 'Închide', {
          duration: 5000,
          panelClass: ['success-snackbar'],
        });
        this.reviewForm.reset();
        this.selectedRating = 0;
        this.currentPage = 0;
        this.loadReviews();
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Eroare la trimiterea recenziei:', err);
        this.snackBar.open(
          'A apărut o eroare la trimitere. Încearcă din nou.',
          'Închide',
          {
            duration: 5000,
            panelClass: ['error-snackbar'],
          }
        );
      },
    });
  }

  private markFormGroupTouched(): void {
    Object.values(this.reviewForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.reviewForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Acest câmp este obligatoriu';
    }
    if (control?.hasError('email')) {
      return 'Adresa de email nu este validă';
    }
    if (control?.hasError('minlength')) {
      return 'Mesajul este prea scurt';
    }
    return '';
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 0 && pageNumber < (this.pagedReviews?.totalPages ?? 0)) {
      this.currentPage = pageNumber;
      this.loadReviews();
    }
  }
}
