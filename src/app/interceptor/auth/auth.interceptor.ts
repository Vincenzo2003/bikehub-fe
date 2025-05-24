import { HttpInterceptorFn } from '@angular/common/http'; // Importa HttpInterceptorFn
import { inject } from '@angular/core'; // Importa inject
import { AuthService } from '../../service/auth/auth.service';// Importa il tuo AuthService

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService); // Usa inject() per ottenere il servizio
  const token = authService.getToken();

  if (token) {
    // Clona la richiesta e aggiungi l'header di autorizzazione
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req); // Passa la richiesta (modificata o meno) al prossimo handler
};
