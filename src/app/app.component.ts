import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Per direttive come *ngIf
import { RouterLink, RouterOutlet, Router } from '@angular/router'; // Importa RouterLink e RouterOutlet
import { AuthService } from './service/auth/auth.service'; // <-- Assicurati che il percorso sia corretto e il servizio esista

@Component({
  selector: 'app-root',
  standalone: true, // Questo è importante!
  imports: [
    CommonModule,
    RouterOutlet, // Necessario per <router-outlet>
    RouterLink    // Necessario per routerLink nelle nav bar
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'BikeHubFE';

  // Assicurati che AuthService sia iniettato come 'public'
  // in modo che sia accessibile dal template (app.component.html)
  constructor(public authService: AuthService, private router: Router) { }

  // Assicurati che questo metodo sia definito qui
  logout() {
    this.authService.logout(); // Chiama il metodo logout del tuo AuthService
    this.router.navigate(['/login']); // Reindirizza alla pagina di login dopo il logout
  }
}
