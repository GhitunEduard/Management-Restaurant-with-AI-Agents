import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

// Importurile necesare pentru a folosi serviciul
import { ContactService } from '../../services/contact.service';
import { ContactInfo as BackendContactInfo } from '../../models/contact/contact-info.model';

// Interfețe pentru a structura datele afișate
interface DisplayContactInfo {
  address: string;
  phone: string;
  email: string;
}

interface DisplayOpeningHours {
  day: string;
  hours: string;
  closed: boolean;
}

interface DisplaySocialMedia {
  name: string;
  icon: string;
  url: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDividerModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  currentYear = new Date().getFullYear();

  // Am înlocuit datele statice cu proprietăți care vor fi populate dinamic
  displayContactInfo?: DisplayContactInfo;
  displayOpeningHours: DisplayOpeningHours[] = [];
  displaySocialMedia: DisplaySocialMedia[] = [];

  quickLinks = [
    { name: 'Despre Noi', section: 'about' },
    { name: 'Meniu', section: 'menu' },
    { name: 'Rezervări', section: 'reservations' },
    { name: 'Galerie', section: 'gallery' },
    { name: 'Contact', section: 'contact' },
  ];

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.contactService.getInfo().subscribe({
      next: (backendData) => {
        // Populăm proprietățile cu datele primite de la backend
        this.displayContactInfo = {
          address: backendData.address,
          phone: backendData.phone,
          email: backendData.email,
        };
        this.displayOpeningHours = this.parseSchedule(backendData.schedule);
        this.displaySocialMedia = this.buildSocialMedia(backendData);
      },
      error: (err) =>
        console.error('Eroare la preluarea datelor pentru footer:', err),
    });
  }

  // Funcție de transformare pentru program (refolosită)
  private parseSchedule(scheduleString: string): DisplayOpeningHours[] {
    if (!scheduleString) return [];
    return scheduleString.split(',').map((part) => {
      const firstColonIndex = part.indexOf(':');
      if (firstColonIndex === -1) {
        return { day: part.trim(), hours: 'Închis', closed: true };
      }
      const day = part.substring(0, firstColonIndex).trim();
      const hours = part.substring(firstColonIndex + 1).trim();
      return {
        day: day,
        hours: hours,
        closed:
          hours.toLowerCase() === 'chiuso' || hours.toLowerCase() === 'închis',
      };
    });
  }

  // Funcție de transformare pentru social media (refolosită)
  private buildSocialMedia(data: BackendContactInfo): DisplaySocialMedia[] {
    const socialMediaArray: DisplaySocialMedia[] = [];
    if (data.facebookUrl) {
      socialMediaArray.push({
        name: 'Facebook',
        icon: 'facebook',
        url: data.facebookUrl,
      });
    }
    if (data.instagramUrl) {
      socialMediaArray.push({
        name: 'Instagram',
        icon: 'camera_alt',
        url: data.instagramUrl,
      });
    }
    if (data.tripadvisorUrl) {
      socialMediaArray.push({
        name: 'TripAdvisor',
        icon: 'travel_explore',
        url: data.tripadvisorUrl,
      });
    }
    return socialMediaArray;
  }

  // Funcțiile existente, actualizate să folosească datele dinamice
  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  openSocialMedia(url: string) {
    window.open(url, '_blank');
  }

  callPhone() {
    if (this.displayContactInfo) {
      window.open(`tel:${this.displayContactInfo.phone}`);
    }
  }

  sendEmail() {
    if (this.displayContactInfo) {
      window.open(`mailto:${this.displayContactInfo.email}`);
    }
  }
}
