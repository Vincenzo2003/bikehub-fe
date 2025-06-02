// src/app/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, UserRole } from '../service/auth/auth.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: '<p>Loading home...</p>', // Un semplice messaggio di caricamento
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.getRole().subscribe(role => {
      if (role === UserRole.Admin) {
        this.router.navigate(['/admin']);
      } else if (role === UserRole.Customer) { // Assuming 'customer' maps to UserRole.Customer
        this.router.navigate(['/customer']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
