import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth/auth.service'; // Creeremo questo servizio

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: (success: any) => {
          if (success) {
            console.log('Login successfully!');
            this.router.navigate(['/']);
            alert('Login successfully!');
          } else {
            alert('Invalid credentials!');
          }
        },
        error: (err: any) => {
          console.error('Login error:', err);
          alert('Login error. Retry.');
        }
      });
    } else {
      alert('Please fill out all fields correctly.');
      console.log('Form not valid:', this.loginForm.controls);
    }
  }
}
