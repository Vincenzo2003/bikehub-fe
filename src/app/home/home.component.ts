
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, UserRole } from '../service/auth/auth.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: '<p>Loading home...</p>',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.getRole().subscribe(role => {
      if (role === UserRole.Admin) {
        this.router.navigate(['/admin']);
      } else if (role === UserRole.Customer) {
        this.router.navigate(['/user']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
