import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../../service/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Usiamo l'Observable isUserAdmin$ del servizio
  return authService.isUserAdmin().pipe(
    map(isAdmin => {
      if (isAdmin) {
        return true; // L'utente è admin, permette l'accesso
      } else {
        // L'utente non è admin, reindirizza alla pagina di login o a una pagina di accesso negato
        router.navigate(['/login']);
        alert('Accesso negato: non hai i permessi di amministratore.');
        return false;
      }
    })
  );
};
