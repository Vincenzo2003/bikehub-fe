import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, tap } from 'rxjs/operators'; // Import tap for side effects
import { AuthService, UserRole } from '../../service/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return true;
  // Get the Observable of the user's role
  return authService.getRole().pipe(
    // Map the UserRole to a boolean indicating if it's an Admin
    map(role => role === UserRole.Admin),
    // Use tap for side effects (navigation and alert) if the user is not an admin
    tap(isAdmin => {
      if (!isAdmin) {
        router.navigate(['/login']);
        alert('Accesso negato: non hai i permessi di amministratore.');
      }
    })
  );
};
