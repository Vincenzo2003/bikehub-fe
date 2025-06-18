import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {jwtDecode} from 'jwt-decode';
import {AuthenticationService as GeneratedApiService} from '../../../gen/bikehub/api/authentication.service';
import {AuthLogin, Login, SignUp, SignUp201Response} from '../../../gen/bikehub';


export enum UserRole {
  Customer = 'CUSTOMER',
  Admin = 'ADMIN',
  Guest = 'GUEST'
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this._isLoggedIn.asObservable();

  private _role = new BehaviorSubject<UserRole>(UserRole.Guest);
  role$ = this._role.asObservable();


  private _username = new BehaviorSubject<string | null>(null);
  username$ = this._username.asObservable();

  private readonly TOKEN_KEY = 'authToken';

  constructor(
    private generatedApiService: GeneratedApiService,
    private router: Router
  ) {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const loggedIn = !!token;
    this._isLoggedIn.next(loggedIn);

    if (loggedIn) {
      this.decodeAndSetUserData(token!);
    } else {
      this._role.next(UserRole.Guest);
      this._username.next(null);
    }
  }


  private decodeAndSetUserData(token: string): void {
    try {
      const decodedToken: any = jwtDecode(token);

      const userRole: string = decodedToken.role;
      if (userRole === 'CUSTOMER') {
        this._role.next(UserRole.Customer);
      } else if (userRole === 'ADMIN') {
        this._role.next(UserRole.Admin);
      } else {
        this._role.next(UserRole.Guest);
      }
      console.log('Ruolo utente dal token:', userRole);

      const username: string = decodedToken.sub;
      this._username.next(username); // Imposta l'username
      console.log('Username utente dal token:', username);

    } catch (error) {
      console.error('Errore durante la decodifica del token JWT:', error);
      this._role.next(UserRole.Guest);
      this._username.next(null); // Resetta l'username in caso di errore
      this.logout(); // Effettua il logout in caso di token non valido
    }
  }

  login(username: string, password: string): Observable<boolean> {
    const loginRequest: Login = { username, password };

    return this.generatedApiService.login(loginRequest).pipe(
      tap((response: AuthLogin) => {
        if (response.accessToken) {
          localStorage.setItem(this.TOKEN_KEY, response.accessToken);
          this._isLoggedIn.next(true);
          this.decodeAndSetUserData(response.accessToken); // Chiamiamo il metodo aggiornato dopo il login
          console.log('Login riuscito! Token e dati utente salvati.');
        } else {
          console.warn('Login riuscito, ma nessun token nella risposta.');
          this._isLoggedIn.next(false);
          this._role.next(UserRole.Guest);
          this._username.next(null);
        }
      }),
      map(() => true),
      catchError((error) => {
        console.error('Errore durante il login:', error);
        this._isLoggedIn.next(false);
        this._role.next(UserRole.Guest);
        this._username.next(null);
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
    this._role.next(UserRole.Guest);
    this._username.next(null); // Resetta l'username al logout
    this.router.navigate(['/login']);
    console.log('Logout effettuato. Token e dati utente rimossi.');
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRole(): Observable<UserRole> {
    return this.role$;
  }

  // NUOVO: Metodo per ottenere l'username come Observable
  getUsername(): Observable<string | null> {
    return this.username$;
  }
}
