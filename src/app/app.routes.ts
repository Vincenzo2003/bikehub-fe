import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component'; // Importa il LoginComponent
import { SignupComponent } from './signup/signup.component'; // Importa il SignupComponent

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
  // Puoi aggiungere altre rotte qui in futuro, es. per una dashboard
  // { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] }
];
