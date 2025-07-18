import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { type Observable } from 'rxjs';
import type { ActivityLog } from '../models/logs/activity-log.model';

@Injectable({
  providedIn: 'root',
})
export class ActivityLogService {
  // Portul 8085 este cel pe care rulează logs-service (confirmat anterior)
  private apiUrl = 'http://localhost:8083/api/logs';

  private http = inject(HttpClient);

  /**
   * Preia lista de log-uri de activitate de pe server.
   *
   * Notă: Nu trebuie să adăugăm token-ul JWT aici.
   * HttpInterceptor-ul pe care l-am creat se va ocupa automat de asta.
   */
  getLogs(): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(this.apiUrl);
  }
}
