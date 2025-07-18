import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GoogleMap, MapMarker, MapGeocoder } from '@angular/google-maps';
import { ContactService } from '../../services/contact.service';
import { ContactInfo as BackendContactInfo } from '../../models/contact/contact-info.model';

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
  color: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    GoogleMap,
    MapMarker,
  ],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent implements OnInit {
  displayContactInfo?: DisplayContactInfo;
  displayOpeningHours: DisplayOpeningHours[] = [];
  displaySocialMedia: DisplaySocialMedia[] = [];

  mapOptions: google.maps.MapOptions = {
    center: { lat: 46.77028, lng: 23.58917 },
    zoom: 16,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  };

  // PASUL 1: Declarăm proprietatea ca fiind opțională, FĂRĂ inițializare.
  markerOptions?: google.maps.MarkerOptions;

  markerPosition?: google.maps.LatLngLiteral;

  constructor(
    private contactService: ContactService,
    private geocoder: MapGeocoder
  ) {}

  ngOnInit(): void {
    // PASUL 2: Inițializăm proprietatea AICI, în interiorul ngOnInit.
    this.markerOptions = {
      animation: google.maps.Animation.DROP,
    };

    this.contactService.getInfo().subscribe({
      next: (backendData) => {
        this.displayContactInfo = {
          address: backendData.address,
          phone: backendData.phone,
          email: backendData.email,
        };
        this.displayOpeningHours = this.parseSchedule(backendData.schedule);
        this.displaySocialMedia = this.buildSocialMedia(backendData);
        this.geocodeAddress(backendData.address);
      },
      error: (err) =>
        console.error('Eroare la preluarea datelor de contact:', err),
    });
  }

  geocodeAddress(address: string) {
    this.geocoder.geocode({ address: address }).subscribe(({ results }) => {
      if (results && results.length > 0) {
        const location = results[0].geometry.location;
        this.mapOptions = { ...this.mapOptions, center: location.toJSON() };
        this.markerPosition = location.toJSON();
      } else {
        console.error('Adresa nu a putut fi geocodată:', address);
      }
    });
  }

  private parseSchedule(scheduleString: string): DisplayOpeningHours[] {
    if (!scheduleString) return [];
    return scheduleString.split(',').map((part) => {
      const firstColonIndex = part.indexOf(':');
      if (firstColonIndex === -1) {
        return { day: part.trim(), hours: 'Chiuso', closed: true };
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
  private buildSocialMedia(data: BackendContactInfo): DisplaySocialMedia[] {
    const socialMediaArray: DisplaySocialMedia[] = [];
    if (data.facebookUrl) {
      socialMediaArray.push({
        name: 'Facebook',
        icon: 'facebook',
        url: data.facebookUrl,
        color: '#1877f2',
      });
    }
    if (data.instagramUrl) {
      socialMediaArray.push({
        name: 'Instagram',
        icon: 'camera_alt',
        url: data.instagramUrl,
        color: '#e4405f',
      });
    }
    if (data.tripadvisorUrl) {
      socialMediaArray.push({
        name: 'TripAdvisor',
        icon: 'travel_explore',
        url: data.tripadvisorUrl,
        color: '#00af87',
      });
    }
    return socialMediaArray;
  }
  openSocialMedia(url: string): void {
    window.open(url, '_blank');
  }
  openMaps(): void {
    if (this.displayContactInfo) {
      const address = encodeURIComponent(this.displayContactInfo.address);
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${address}`,
        '_blank'
      );
    }
  }
  callPhone(): void {
    if (this.displayContactInfo) {
      window.open(`tel:${this.displayContactInfo.phone}`);
    }
  }
  sendEmail(): void {
    if (this.displayContactInfo) {
      window.open(`mailto:${this.displayContactInfo.email}`);
    }
  }
}
