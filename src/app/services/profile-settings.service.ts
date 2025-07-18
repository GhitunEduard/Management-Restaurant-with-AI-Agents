import { Injectable, inject } from '@angular/core';
import { HttpClient, type HttpEvent } from '@angular/common/http';
import { type Observable, throwError } from 'rxjs';
import { tap, filter } from 'rxjs/operators';
import { AuthService } from './auth.service';
import type { User } from '../models/user/user.model'; // Folosim modelul 'User' standardizat
import type { UpdateUserRequest } from '../models/user/update-user.model';
import type { UploadResponse } from '../models/user/upload-response.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileSettingsService {
  // Portul 8083 este al serviciului de autentificare, unde se află API-ul de users
  private apiUrl = 'http://localhost:8082/api/users';

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  /**
   * Returnează un Observable care emite profilul utilizatorului curent.
   * Este legat direct de starea din AuthService, fiind eficient și reactiv.
   */
  getCurrentUserProfile(): Observable<User> {
    return this.authService.currentUser$.pipe(
      filter((user): user is User => user !== null)
    );
  }

  /**
   * Actualizează profilul utilizatorului curent.
   */
  updateUserProfile(updateData: UpdateUserRequest): Observable<User> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return throwError(
        () => new Error('No authenticated user found for update.')
      );
    }

    return this.http.put<User>(`${this.apiUrl}/${userId}`, updateData).pipe(
      tap(() => {
        // După un update reușit, spunem AuthService să-și reîmprospăteze datele de pe server.
        // Componentele abonate la currentUser$ vor primi automat noile date.
        this.authService.refreshCurrentUser();
      })
    );
  }

  /**
   * Încarcă o imagine de profil pentru utilizatorul curent.
   */
  uploadProfileImage(file: File): Observable<HttpEvent<UploadResponse>> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return throwError(
        () => new Error('No authenticated user found for image upload.')
      );
    }

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadResponse>(
      `${this.apiUrl}/${userId}/upload-image`,
      formData,
      {
        reportProgress: true,
        observe: 'events',
      }
    );
  }

  /**
   * Spune serviciului de autentificare să își reîmprospăteze datele.
   * Util după un upload de imagine reușit.
   */
  refreshUserData(): void {
    this.authService.refreshCurrentUser();
  }

  /**
   * Verifică dacă utilizatorul curent are rol de ADMIN.
   */
  canPerformAdminActions(): boolean {
    return this.authService.getCurrentUserRole() === 'ADMIN';
  }
}
