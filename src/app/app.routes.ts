import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component'; // Importa il LoginComponent
import { SignupComponent } from './signup/signup.component'; // Importa il SignupComponent
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component'; // Importa la dashboard
import { authGuard } from './guard/auth/auth.guard';
import {BikeManagementComponent} from './admin-dashboard/bike-management/bike-management.component';
import {HomeComponent} from './home/home.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard], // Proteggi questa rotta con la guard
    children: [ // Rotte figlie per la dashboard amministrativa
      { path: 'bikes-management', component: BikeManagementComponent },
      // { path: 'equipment', component: EquipmentManagementComponent },
      // { path: 'rates', component: RatesManagementComponent },
      // { path: 'usage', component: UsageStatisticsComponent },
    ]
  },
  {
    path: 'home', // Nuova rotta home
    component: HomeComponent,
    canActivate: [authGuard] // Proteggi la rotta home con la guard di autenticazione
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
  // Puoi aggiungere altre rotte qui in futuro, es. per una dashboard
  // { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] }
];
