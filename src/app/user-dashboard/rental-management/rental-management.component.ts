// src/app/user-dashboard/rental-management/rental-management.component.ts

import {Component, OnInit, OnDestroy} from '@angular/core'; // Aggiungi OnDestroy
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {finalize, Subscription} from 'rxjs'; // Importa Subscription

import {RentalManagementService} from '../../service/rental/rental.service';
import {AuthService, UserRole} from '../../service/auth/auth.service'; // Importa AuthService e UserRole
import {
  Bicycle,
  BicycleService,
  CreateRental,
  PaymentType,
  PayRental,
  Rental,
  RentalStatus,
  ReturnRentalDetails,
} from '../../../gen/bikehub';

@Component({
  selector: 'app-rental',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rental-management.component.html',
  styleUrls: ['./rental-management.component.css'],
})
export class RentalComponent implements OnInit, OnDestroy { // Implementa OnDestroy
  // State management
  availableBicycles: Bicycle[] = [];
  currentRental: Rental | null = null;
  currentRentalStatus: RentalStatus | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  // Form inputs
  selectedBicycleId: string = '';
  returnParkingLotName: string | null | undefined = null;

  selectedPaymentType: PaymentType = PaymentType.CreditCard;
  paymentTypes = Object.values(PaymentType);

  currentUserUsername: string | null = null; // Sarà impostato dal AuthService
  private usernameSubscription: Subscription | undefined; // Per gestire la sottoscrizione

  constructor(
    private rentalManagementService: RentalManagementService,
    private bicycleService: BicycleService,
    private authService: AuthService // Inietta AuthService
  ) {}

  ngOnInit(): void {
    // Sottoscriviti all'username per ottenere l'utente corrente
    this.usernameSubscription = this.authService.getUsername().subscribe(username => {
      this.currentUserUsername = username;
      // Solo dopo aver ottenuto l'username, puoi tentare di recuperare i noleggi
      if (this.currentUserUsername) {
        this.fetchCurrentRentalForUser();
      } else {
        // Se non c'è username (utente non loggato), mostra le biciclette disponibili per book
        this.fetchAvailableBicycles();
      }
    });
  }

  ngOnDestroy(): void {
    // È fondamentale disiscriversi per evitare memory leak
    if (this.usernameSubscription) {
      this.usernameSubscription.unsubscribe();
    }
  }

  fetchAvailableBicycles(): void {
    this.setLoading();
    this.bicycleService
      .retrieveBicycles(0, 50)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (page) => {
          this.availableBicycles =
            page.results?.filter((b) => b.status === 'AVAILABLE') || [];
        },
        error: (err: any) => this.handleError('Failed to fetch bicycles', err)
      });
  }

  fetchCurrentRentalForUser(): void {
    if (!this.currentUserUsername) { // Aggiungi un controllo esplicito
      console.warn('Cannot fetch current rental: currentUserUsername is not set.');
      this.fetchAvailableBicycles(); // Se l'username non è impostato, mostra le bici disponibili
      return;
    }

    this.setLoading();
    this.rentalManagementService
      .retrieveUserRentalsByStatuses(this.currentUserUsername, [ // Usa this.currentUserUsername
        RentalStatus.Created,
        RentalStatus.InProgress,
        RentalStatus.Finished,
      ])
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (rentals: Rental[]) => {
          if (rentals && rentals.length > 0) {
            this.currentRental = rentals[0];
            if (this.currentRental) {
              this.currentRentalStatus = this.currentRental.status;
            }
            console.log('Active rental found:', this.currentRental);
          } else {
            this.currentRental = null;
            this.currentRentalStatus = null;
            console.log('No active rental found for the user (empty list).');
            this.fetchAvailableBicycles();
          }
        },
        error: (err) => {
          this.handleError('Failed to fetch current rental', err);
          this.fetchAvailableBicycles();
        },
      });
  }
  // ... (restanti metodi bookBicycle, pickUp, returnRental, payForRental, setLoading, handleError)
  bookBicycle(): void {
    if (!this.selectedBicycleId) return;
    this.setLoading();
    const rentalDetails: CreateRental = { bicycleId: this.selectedBicycleId };

    this.rentalManagementService
      .createRental(rentalDetails)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (rental) => {
          this.currentRental = rental;
          this.currentRentalStatus = rental.status; // Aggiorna lo stato del noleggio corrente
        },
        error: (err) => this.handleError('Failed to book rental', err),
      });
  }

  pickUp(): void {
    if (!this.currentRental?.id) return;
    this.setLoading();
    this.rentalManagementService
      .pickupRental(this.currentRental.id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (rental) => {
          this.currentRental = rental;
          this.currentRentalStatus = rental.status; // Aggiorna lo stato del noleggio corrente
        },
        error: (err) => this.handleError('Failed to pick up rental', err),
      });
  }

  returnRental(): void {
    if (!this.currentRental?.id) {
      return;
    }
    this.setLoading();
    const returnDetails: ReturnRentalDetails = {
      returnParkingLotName: this.returnParkingLotName?.trim() || null,
    };
    this.rentalManagementService
      .returnRental(this.currentRental.id, returnDetails)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (rental) => {
          this.currentRental = rental;
          this.currentRentalStatus = rental.status; // Aggiorna lo stato del noleggio corrente
        },
        error: (err) => this.handleError('Failed to return rental', err),
      });
  }

  payForRental(): void {
    if (!this.currentRental?.id) return;

    this.setLoading();
    const paymentDetails: PayRental = { paymentType: this.selectedPaymentType };

    this.rentalManagementService
      .payRental(this.currentRental.id, paymentDetails)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (rental) => {
          this.currentRental = rental;
          this.currentRentalStatus = rental.status; // Aggiorna lo stato del noleggio corrente
          // Se il pagamento è andato a buon fine, potremmo voler pulire il noleggio corrente
          // per permettere all'utente di iniziare un nuovo ciclo.
          if (rental.status === RentalStatus.Payed) {
            this.currentRental = null;
            this.currentRentalStatus = null;
            this.fetchAvailableBicycles(); // Ricarica le biciclette per un nuovo noleggio
          }
        },
        error: (err) => this.handleError('Payment failed', err),
      });
  }

  // --- UTILITY METHODS ---

  private setLoading(): void {
    this.isLoading = true;
    this.errorMessage = null;
  }

  private handleError(message: string, error: any): void {
    this.errorMessage = `${message}: ${error.error?.message || error.message}`;
    console.error(error);
  }

  protected readonly RentalStatus = RentalStatus;
}
