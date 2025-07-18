import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Un gardian funcțional (functional guard) care previne accesul la o rută
 * dacă utilizatorul este deja autentificat.
 *
 * @returns {boolean} `true` dacă utilizatorul nu este autentificat (permite accesul),
 * sau `false` dacă este autentificat (blochează accesul și redirecționează).
 */
export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifică starea de autentificare folosind serviciul AuthService
  if (authService.isLoggedIn()) {
    // Dacă utilizatorul este deja autentificat, îl redirecționăm către pagina principală
    console.log('User is already logged in. Redirecting to /dashboard.');
    router.navigate(['/dashboard']);
    // Și prevenim accesul la pagina de login
    return false;
  }

  // Dacă utilizatorul nu este autentificat, permitem accesul la pagina de login
  return true;
};
