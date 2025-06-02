import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Per direttive come *ngIf
import { RouterLink, RouterOutlet, Router } from '@angular/router'; // Importa RouterLink e RouterOutlet
import {AppHeaderComponent} from './shared/app-header/app-header.component'; // <-- Assicurati che il percorso sia corretto e il servizio esista

@Component({
  selector: 'app-root',
  standalone: true, // Questo è importante!
  imports: [
    CommonModule,
    RouterOutlet, // Necessario per <router-outlet>
    AppHeaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'BikeHubFE';
}
