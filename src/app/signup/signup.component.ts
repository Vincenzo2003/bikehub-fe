import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms'; // Importa anche AbstractControl e ValidatorFn
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.signupForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required]),
      phoneNumber: new FormControl('')
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator: ValidatorFn = (form: AbstractControl): { [key: string]: boolean } | null => {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (!password || !confirmPassword || password.value === confirmPassword.value) {
      return null;
    }
    return { 'mismatch': true };
  };

  onSubmit() {
    if (this.signupForm.valid) {
      const { username, email, password, phoneNumber } = this.signupForm.value;
      this.authService.signup(username, email, password, phoneNumber).subscribe({
        next: (success: any) => {
          if (success) {
            console.log('Registrazione riuscita!');
            this.router.navigate(['/login']);
            alert('Registrazione Riuscita! Ora puoi effettuare il login.');
          } else {
            alert('Errore durante la registrazione. Forse l\'utente esiste già?');
          }
        },
        error: (err: any) => {
          console.error('Errore durante la registrazione:', err);
          alert('Si è verificato un errore durante la registrazione. Riprova.');
        }
      });
    } else {
      alert('Per favore, compila tutti i campi correttamente e assicurati che le password corrispondano.');
      console.log('Form non valido:', this.signupForm.controls);
    }
  }
}
