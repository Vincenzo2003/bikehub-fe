import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { AuthService, UserRole } from '../../service/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return true;

  return authService.getRole().pipe(

    map(role => role === UserRole.Admin),

    tap(isAdmin => {
      if (!isAdmin) {
        router.navigate(['/login']);
        alert('Accesso negato: non hai i permessi di amministratore.');
      }
    })
  );
};
