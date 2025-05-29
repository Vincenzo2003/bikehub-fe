import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode'; // Importa jwtDecode

import { AuthenticationService as GeneratedApiService} from '../../../gen/bikehub/api/authentication.service';
import {Login, AuthLogin, SignUp, SignUp201Response, AccountRole} from '../../../gen/bikehub';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this._isLoggedIn.asObservable();

  private _isAdmin = new BehaviorSubject<boolean>(false); // Nuovo BehaviorSubject per il ruolo Admin
  isAdmin$ = this._isAdmin.asObservable(); // Espone l'Observable

  private readonly TOKEN_KEY = 'authToken';

  constructor(
    private generatedApiService: GeneratedApiService,
    private router: Router
  ) {
    this.checkAuthStatus(); // Controlla lo stato all'avvio
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const loggedIn = !!token;
    this._isLoggedIn.next(loggedIn);

    if (loggedIn) {
      this.decodeAndSetRole(token!); // Decodifica e imposta il ruolo
    } else {
      this._isAdmin.next(false); // Se non loggato, non è admin
    }
  }

  private decodeAndSetRole(token: string): void {
    try {
      const decodedToken: any = jwtDecode(token);
      const userRole: string = decodedToken.role;
      this._isAdmin.next(userRole === 'ADMIN');
      console.log('Ruolo utente dal token:', userRole);
    } catch (error) {
      console.error('Errore durante la decodifica del token JWT:', error);
      this._isAdmin.next(false); // In caso di errore, non è admin
      this.logout(); // Potrebbe essere opportuno fare il logout se il token è invalido
    }
  }

  login(username: string, password: string): Observable<boolean> {
    const loginRequest: Login = { username, password }; // Crea l'oggetto request tipizzato

    return this.generatedApiService.login(loginRequest).pipe(
      tap((response: AuthLogin) => {
        if (response.accessToken) {
          localStorage.setItem(this.TOKEN_KEY, response.accessToken);
          this._isLoggedIn.next(true);
          this.decodeAndSetRole(response.accessToken); // Decodifica il ruolo dopo il login
          console.log('Login riuscito! Token salvato.');
        } else {
          console.warn('Login riuscito, ma nessun token nella risposta.');
          this._isLoggedIn.next(false);
          this._isAdmin.next(false);
        }
      }),
      map(() => true),
      catchError((error) => {
        console.error('Errore durante il login:', error);
        this._isLoggedIn.next(false);
        this._isAdmin.next(false);
        return of(false);
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
      tap((response: SignUp201Response) => {
        console.log('Registrazione riuscita!', response);
      }),
      map(() => true),
      catchError((error) => {
        console.error('Errore durante la registrazione:', error);
        return of(false);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this._isLoggedIn.next(false);
    this._isAdmin.next(false); // Resetta il ruolo admin al logout
    this.router.navigate(['/login']);
    console.log('Logout effettuato. Token rimosso.');
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isUserAdmin(): Observable<boolean> {
    return this.isAdmin$;
  }
}
