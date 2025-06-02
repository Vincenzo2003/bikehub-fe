// src/app/shared/app-header/app-header.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router'; // Necessario per routerLink e per la navigazione
import { AuthService } from '../../service/auth/auth.service'; // Creeremo questo servizio
import { Subscription } from 'rxjs'; // Per gestire la sottoscrizione allo stato del login

@Component({
  selector: 'app-app-header', // Il selettore che useremo nel template padre
  standalone: true, // Indica che è un componente standalone
  imports: [
    CommonModule,  // Per @if
    RouterLink     // Per routerLink
  ],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.css' // Percorso al tuo CSS
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  private authSubscription!: Subscription; // Useremo '!' perché verrà inizializzato in ngOnInit

  // Inietta il servizio di autenticazione e il Router
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Sottoscriviti allo stato del login dal servizio di autenticazione.
    // Ogni volta che lo stato cambia (login/logout), aggiorniamo isLoggedIn.
    this.authSubscription = this.authService.isLoggedIn$.subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
    });
  }

  ngOnDestroy(): void {
    // È fondamentale disiscriversi dagli Observable per prevenire memory leak
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  logout(): void {
    // Chiama il metodo di logout dal AuthService.
    // L'AuthService gestirà la rimozione del token e il reindirizzamento al login.
    this.authService.logout();
    // Non è necessario navigare qui, perché authService.logout() dovrebbe già reindirizzare.
  }
}
