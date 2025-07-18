import { Injectable, inject } from '@angular/core';
import {
  type CanActivate,
  type ActivatedRouteSnapshot,
  type RouterStateSnapshot,
  Router,
  type UrlTree,
} from '@angular/router';
import { type Observable, of } from 'rxjs';
import { map, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    // Returnăm un Observable pentru a gestiona logica asincronă
    return this.authService.authCheckCompleted$.pipe(
      // Așteptăm până când `authCheckCompleted$` emite `true`
      filter((isComplete) => isComplete),
      take(1), // Luăm prima valoare `true` și încheiem subscripția
      // Folosim switchMap pentru a trece la logica de verificare a autentificării
      switchMap(() => {
        if (this.authService.isLoggedIn()) {
          const requiredRole = route.data['requiredRole'] as string | undefined;

          if (requiredRole) {
            const userRole = this.authService.getCurrentUserRole();
            if (userRole !== requiredRole) {
              // Dacă rolul nu corespunde, redirecționăm
              return of(this.router.createUrlTree(['/unauthorized']));
            }
          }
          // Utilizatorul este logat și are rolul necesar (dacă e specificat)
          return of(true);
        }

        // Utilizatorul nu este logat, redirecționăm la pagina de login
        return of(this.router.createUrlTree(['/login']));
      })
    );
  }
}
