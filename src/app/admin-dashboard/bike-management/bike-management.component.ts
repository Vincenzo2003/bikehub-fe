import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe, NgClass } from '@angular/common';

import {
  Bicycle,
  BicycleCategory,
  BicyclesPage,
  BicycleStatus,
  CreateBicycle,
  UpdateBicycle
} from '../../../gen/bikehub';
import { AddBikeModalComponent } from './add-bike-modal/add-bike-modal.component';

@Component({
  selector: 'app-bike-management',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    NgClass,
    AddBikeModalComponent
  ],
  templateUrl: './bike-management.component.html',
  styleUrls: ['./bike-management.component.css']
})
export class BikeManagementComponent implements OnInit {
  bicycles: Array<Bicycle> | undefined = [];
  bicycleForm: FormGroup;
  errorMessage: string = '';

  bicycleCategories = Object.values(BicycleCategory);

  showAddBikeModal: boolean = false;

  private readonly API_URL = 'http://localhost:8080'

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.bicycleForm = this.fb.group({
      currentParkingLotName: ['', Validators.required],
      category: [null, Validators.required],
      chassisId: [{ value: '', disabled: false }, Validators.required],
      brand: ['', Validators.required],
      model: ['', Validators.required],
      hourlyPrice: [10.00, [Validators.required, Validators.min(0.01)]],
      status: [BicycleStatus.Available]
    });
  }

  ngOnInit(): void {
    this.loadBicycles();
  }

  loadBicycles(): void {
    const params = new HttpParams()
      .set('page', 0)
      .set('count', 50);

    this.http.get<BicyclesPage>(`${this.API_URL}/bicycles`, { params }).subscribe({
      next: (response) => {
        this.bicycles = response.results;
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = 'Failed to load bicycles. Ensure backend is running and you are logged in as admin.';
        console.error('Error loading bicycles:', err);
      }
    });
  }

  openAddBikeModal(): void {
    this.showAddBikeModal = true;
    this.errorMessage = '';
  }

  closeAddBikeModal(): void {
    this.showAddBikeModal = false;
    this.errorMessage = '';
  }

  /**
   * Handles the event emitted by the AddBikeModalComponent when a new bike is to be added.
   * @param newBikeData The data for the new bicycle from the modal's form.
   */
  handleAddBike(newBikeData: any): void {
    const categoriesArray: BicycleCategory[] = newBikeData.categories ? (newBikeData.categories as BicycleCategory[]) : [];

    console.log('Sending categories to backend:', categoriesArray);

    const createData: CreateBicycle = {
      currentParkingLotName: newBikeData.currentParkingLotName,
      categories: categoriesArray,
      chassisId: newBikeData.chassisId,
      brand: newBikeData.brand,
      model: newBikeData.model,
      hourlyPrice: newBikeData.hourlyPrice
    };

    this.http.post<Bicycle>(`${this.API_URL}/bicycle`, createData).subscribe({
      next: (newBicycle) => {
        console.log('Bicycle added successfully:', newBicycle);
        this.closeAddBikeModal();
        this.loadBicycles();
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Error adding bicycle:', err);
        this.errorMessage = err.error?.message || 'Failed to add bicycle. Please check the data.';
      }
    });
  }
}
