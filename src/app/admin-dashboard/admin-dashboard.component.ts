import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router'; // Importa RouterOutlet e RouterLink

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, // Necessario per il <router-outlet> interno
    RouterLink    // Necessario per i routerLink nella navbar admin
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
  // Logica specifica della dashboard se necessaria
}
