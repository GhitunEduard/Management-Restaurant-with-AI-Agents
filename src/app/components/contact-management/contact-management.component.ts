import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ContactService } from '../../services/contact.service'; // Asigură-te că calea este corectă
import { ContactInfo } from '../../models/contact/contact-info.model'; // Asigură-te că calea este corectă

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Component({
  selector: 'app-contact-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './contact-management.component.html',
  styleUrls: ['./contact-management.component.css'],
})
export class ContactManagementComponent implements OnInit {
  // Stări de încărcare/salvare
  isLoading = false;
  isSaving = false;

  // Obiectul ContactInfo ce va fi editat
  contactInfo: ContactInfo | null = null;

  // Formular reactiv pentru editarea informațiilor de contact
  contactForm: FormGroup;

  // Sistemul de notificări (preluat din celelalte componente)
  notifications: Notification[] = [];
  private notificationIdCounter = 1;

  // Injectăm serviciile necesare
  private contactService = inject(ContactService);
  private fb = inject(FormBuilder); // Pentru formularul reactiv

  constructor() {
    // Inițializăm formularul cu validări corespunzătoare DTO-ului Java
    this.contactForm = this.fb.group({
      id: [null], // ID-ul va fi setat doar la încărcare, nu este obligatoriu în formular
      address: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(255),
        ],
      ],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      schedule: ['', Validators.required],
      facebookUrl: ['', Validators.pattern('^(https?|ftp)://.*$')], // Validare simplă URL
      instagramUrl: ['', Validators.pattern('^(https?|ftp)://.*$')],
      tripadvisorUrl: ['', Validators.pattern('^(https?|ftp)://.*$')],
    });
  }

  ngOnInit(): void {
    this.loadContactInfo(); // Încărcăm informațiile de contact la inițializarea componentei
  }

  /**
   * Încarcă informațiile de contact din backend.
   */
  loadContactInfo(): void {
    this.isLoading = true;
    this.contactService.getInfo().subscribe({
      next: (data) => {
        this.contactInfo = data;
        // Populează formularul cu datele primite, dacă există
        if (data) {
          this.contactForm.patchValue(data);
        }
        this.isLoading = false;
        this.showNotification('Informații de contact încărcate cu succes!');
      },
      error: (error) => {
        console.error('Eroare la încărcarea informațiilor de contact:', error);
        this.showNotification(
          'Eroare la încărcarea informațiilor de contact',
          'error'
        );
        this.isLoading = false;
        // Dacă nu există date (404), vom lăsa formularul gol pentru a permite crearea
        this.contactInfo = null;
      },
    });
  }

  /**
   * Salvează informațiile de contact (creare sau actualizare).
   */
  saveContactInfo(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched(); // Marchează toate câmpurile ca atinse pentru a afișa erorile
      this.showNotification(
        'Vă rugăm să corectați erorile din formular.',
        'error'
      );
      return;
    }

    this.isSaving = true;
    const contactData: ContactInfo = this.contactForm.value;

    this.contactService.createOrUpdateInfo(contactData).subscribe({
      next: (savedContact) => {
        this.contactInfo = savedContact; // Actualizează datele locale cu cele salvate (ex: cu ID-ul)
        this.showNotification(
          'Informațiile de contact au fost salvate cu succes!'
        );
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Eroare la salvarea informațiilor de contact:', error);
        this.showNotification(
          'Eroare la salvarea informațiilor de contact',
          'error'
        );
        this.isSaving = false;
      },
    });
  }

  /**
   * Resetează formularul la valorile inițiale sau la un obiect gol.
   */
  resetForm(): void {
    if (this.contactInfo) {
      this.contactForm.patchValue(this.contactInfo);
    } else {
      this.contactForm.reset();
      this.contactForm.patchValue({
        // Setăm valorile implicite
        id: null,
        address: '',
        phone: '',
        email: '',
        schedule: '',
        facebookUrl: '',
        instagramUrl: '',
        tripadvisorUrl: '',
      });
    }
  }

  // Notificări (copiate din OrderManagementComponent pentru consistență)
  showNotification(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'success'
  ): void {
    const notification: Notification = {
      id: this.notificationIdCounter++,
      message,
      type,
    };

    this.notifications.push(notification);

    setTimeout(() => {
      this.removeNotification(notification.id);
    }, 5000); // Notificările dispar după 5 secunde
  }

  removeNotification(id: number): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
  }
}
