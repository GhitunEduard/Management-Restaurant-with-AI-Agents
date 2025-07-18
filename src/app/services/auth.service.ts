import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  type Observable,
  BehaviorSubject,
  ReplaySubject,
  throwError,
} from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import type { LoginRequest } from '../models/user/login-request.model';
import type { AuthenticationResponse } from '../models/user/authentication-response.model';
import type { User } from '../models/user/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8082/api/users';
  private TOKEN_KEY = 'jwt_token';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private authCheckCompleted = new ReplaySubject<boolean>(1);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  public authCheckCompleted$ = this.authCheckCompleted.asObservable();

  private http = inject(HttpClient);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    if (this.isBrowser) {
      this.checkStoredTokenAndFetchUser();
    } else {
      this.authCheckCompleted.next(true);
    }
  }

  /**
   * MODIFICAT: Metoda returnează acum Observable<AuthenticationResponse>
   * pentru a fi compatibilă cu LoginService.
   */
  login(credentials: LoginRequest): Observable<AuthenticationResponse> {
    return this.http
      .post<AuthenticationResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          // Folosim 'tap' pentru a executa logica noastră ca un efect secundar,
          // fără a modifica obiectul (response) care este returnat.
          this.handleTokenAndFetchUser(response.token);
        })
      );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  public refreshCurrentUser(): void {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.error('Cannot refresh, user not logged in.');
      return;
    }
    this.fetchCurrentUser(userId).subscribe();
  }

  /**
   * REINTRODUS: Metodă sincronă pentru compatibilitate.
   */
  public isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  public getCurrentUserId(): number | null {
    return this.currentUserSubject.value?.id || null;
  }

  /**
   * REINTRODUS: Metodă sincronă pentru compatibilitate.
   */
  public getCurrentUserRole(): 'ADMIN' | 'EMPLOYEE' | null {
    return this.currentUserSubject.value?.role || null;
  }

  public getToken(): string | null {
    return this.isBrowser ? localStorage.getItem(this.TOKEN_KEY) : null;
  }

  private handleTokenAndFetchUser(token: string): void {
    const decodedToken = this.decodeToken(token);
    if (!decodedToken || this.isTokenExpired(decodedToken)) {
      this.logout();
      return;
    }
    if (this.isBrowser) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
    this.fetchCurrentUser(parseInt(decodedToken.sub, 10)).subscribe();
  }

  private checkStoredTokenAndFetchUser(): void {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.decodeToken(token);
      if (decodedToken && !this.isTokenExpired(decodedToken)) {
        this.fetchCurrentUser(parseInt(decodedToken.sub, 10)).subscribe({
          next: () => this.authCheckCompleted.next(true),
          error: () => {
            this.logout();
            this.authCheckCompleted.next(true);
          },
        });
        return;
      }
    }
    this.authCheckCompleted.next(true);
  }

  private fetchCurrentUser(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
      })
    );
  }

  private decodeToken(token: string): any | null {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }

  private isTokenExpired(decodedToken: any): boolean {
    const expiry = decodedToken.exp * 1000;
    return Date.now() >= expiry;
  }
}
