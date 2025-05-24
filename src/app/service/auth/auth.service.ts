import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthenticationService as GeneratedApiService} from '../../../gen/bikehub/api/authentication.service';
import {Login, AuthLogin, SignUp, SignUp201Response, AccountRole} from '../../../gen/bikehub';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this._isLoggedIn.asObservable();

  private readonly TOKEN_KEY = 'authToken';

  constructor(
    private generatedApiService: GeneratedApiService,
    private router: Router
  ) {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    // In un'app reale, potresti voler validare il token (es. controllare scadenza)
    this._isLoggedIn.next(!!token); // Aggiorna lo stato in base alla presenza del token
  }

  login(username: string, password: string): Observable<boolean> {
    const loginRequest: Login = { username, password }; // Crea l'oggetto request tipizzato

    return this.generatedApiService.login(loginRequest).pipe(
      tap((response: AuthLogin) => { // AuthResponse dovrebbe essere l'interfaccia generata
        // Assumi che la risposta contenga un campo 'token'
        if (response.accessToken) {
          localStorage.setItem(this.TOKEN_KEY, response.accessToken);
          this._isLoggedIn.next(true); // Aggiorna lo stato
          console.log('Login riuscito! Token salvato.');
        } else {
          console.warn('Login riuscito, ma nessun token nella risposta.');
          this._isLoggedIn.next(false);
        }
      }),
      map(() => true), // Trasforma la risposta in un booleano per i componenti chiamanti
      catchError((error) => {
        console.error('Errore durante il login:', error);
        this._isLoggedIn.next(false);
        return of(false); // Restituisce un Observable di false in caso di errore
      })
    );
  }

  signup(username: string, email: string, password: string, phoneNumber?: string): Observable<boolean> {
    const signupRequest: SignUp = {
      username,
      email,
      password,
      ...(phoneNumber && { phoneNumber: phoneNumber })
    };

    return this.generatedApiService.signUp(signupRequest).pipe(
      tap((response: SignUp201Response) => { // La risposta del signup potrebbe essere diversa
        console.log('Registrazione riuscita!', response);
        // Non salviamo il token qui, l'utente dovrà fare il login dopo la registrazione
      }),
      map(() => true),
      catchError((error) => {
        console.error('Errore durante la registrazione:', error);
        // In una vera app, qui potresti voler gestire errori specifici (es. utente già esistente)
        return of(false);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY); // Rimuovi il token
    this._isLoggedIn.next(false); // Aggiorna lo stato
    this.router.navigate(['/login']); // Reindirizza
    console.log('Logout effettuato. Token rimosso.');
  }

  // Metodo per ottenere il token (utile per HTTP Interceptors)
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
