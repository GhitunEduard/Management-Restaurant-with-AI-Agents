import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactInfo } from '../models/contact/contact-info.model';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  // URL-ul backend-ului tău. Asigură-te că portul este corect (8085).
  private apiUrl = 'http://localhost:8085/api/contact';

  // 1. Injectăm HttpClient pentru a putea face cereri HTTP
  constructor(private http: HttpClient) {}

  // 2. Metoda care face cererea GET către backend
  // Returnează un "Observable" care va emite datele de tip ContactInfo
  getInfo(): Observable<ContactInfo> {
    return this.http.get<ContactInfo>(this.apiUrl);
  }
}
