import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  RentalService,
  CreateRental,
  Rental,
  ReturnRentalDetails,
  PayRental, RentalStatus, RentalsPage
} from '../../../gen/bikehub';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RentalManagementService {
  constructor(private rentalService: RentalService) {}

  /**
   * Books a new bicycle rental.
   * @param rentalDetails - The details required to create a new rental.
   * @returns An Observable of the created Rental.
   */
  createRental(rentalDetails: CreateRental): Observable<Rental> {
    return this.rentalService.createRental(rentalDetails);
  }

  /**
   * Picks up a previously booked rental.
   * @param rentalId - The ID of the rental to pick up.
   * @returns An Observable of the updated Rental.
   */
  pickupRental(rentalId: string): Observable<Rental> {
    return this.rentalService.pickupRental(rentalId);
  }

  /**
   * Returns an active rental.
   * @param rentalId - The ID of the rental to return.
   * @param returnDetails - Optional details about the return.
   * @returns An Observable of the updated Rental.
   */
  returnRental(
    rentalId: string,
    returnDetails?: ReturnRentalDetails
  ): Observable<Rental> {
    return this.rentalService.returnRental(rentalId, returnDetails);
  }

  /**
   * Pays for a completed rental.
   * @param rentalId - The ID of the rental to pay for.
   * @param paymentDetails - Optional details for payment.
   * @returns An Observable of the updated Rental.
   */
  payRental(rentalId: string, paymentDetails?: PayRental): Observable<Rental> {
    return this.rentalService.payRental(rentalId, paymentDetails);
  }

  retrieveUserRentalsByStatuses(userUsername?: string, statuses?: Array<RentalStatus>): Observable<Array<Rental>> {
    var rentalsPageObservable: Observable<RentalsPage> = this.rentalService.retrieveRentals();
    return this.rentalService.retrieveRentals(0, 5, userUsername, statuses)
      .pipe(
        map(rentalsPage => rentalsPage.results || []));
  }
}
