import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactInfo } from '../models/contact/contact-info.model'; // Asigură-te că calea este corectă

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  // URL-ul backend-ului tău. Asigură-te că portul este corect (8085).
  private apiUrl = 'http://localhost:8085/api/contact'; //

  constructor(private http: HttpClient) {} //

  /**
   * Metoda pentru a prelua informațiile de contact existente.
   * Aceasta este aceeași metodă pe care o ai deja în aplicația de client.
   * @returns Un Observable cu informațiile de contact.
   */
  getInfo(): Observable<ContactInfo> {
    return this.http.get<ContactInfo>(this.apiUrl); //
  }

  /**
   * Metoda pentru a crea sau actualiza informațiile de contact.
   * Aceasta va face o cerere POST către backend, trimițând datele de contact.
   * Backend-ul este configurat să gestioneze atât crearea, cât și actualizarea cu aceeași metodă POST.
   * @param contactInfo Obiectul ContactInfo cu datele de actualizat.
   * @returns Un Observable cu informațiile de contact salvate (posibil cu un ID).
   */
  createOrUpdateInfo(contactInfo: ContactInfo): Observable<ContactInfo> {
    // Backend-ul tău utilizează POST pentru a crea sau actualiza.
    // Trimitem întregul obiect ContactInfo.
    return this.http.post<ContactInfo>(this.apiUrl, contactInfo);
  }
}
