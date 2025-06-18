
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../service/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.css'
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  private authSubscription!: Subscription;


  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {


    this.authSubscription = this.authService.isLoggedIn$.subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
    });
  }

  ngOnDestroy(): void {

    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  logout(): void {


    this.authService.logout();

  }
}
