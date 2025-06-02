import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

import {
  Bicycle,
  BicycleCategory,
  BicyclesPage,
  BicycleStatus,
  CreateBicycle,
  UpdateBicycle
} from '../../../gen/bikehub';
import {CurrencyPipe, NgClass, SlicePipe} from '@angular/common'; // Adjust path if necessary


@Component({
  selector: 'app-bike-management',
  templateUrl: './bike-management.component.html',
  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    SlicePipe,
    NgClass
  ],
  styleUrls: ['./bike-management.component.css']
})
export class BikeManagementComponent implements OnInit {
  bicycles: Array<Bicycle> | undefined = []; // Changed to 'bicycles' for consistency
  bicycleForm: FormGroup;
  isEditing: boolean = false;
  selectedBicycle: Bicycle | null = null; // Changed to 'selectedBicycle'
  errorMessage: string = '';

  // Enum values for dropdowns
  bicycleCategories = Object.values(BicycleCategory);
  bicycleStatuses = Object.values(BicycleStatus);
  showAddBikeModal: boolean = false; // Nuova proprietà per controllare la visibilità della modale

  private readonly API_URL = 'http://localhost:8080'; // Fallback to 8080 if not set in environment

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.bicycleForm = this.fb.group({
      currentParkingLotName: ['', Validators.required],
      // For categories, we'll initially use a single select.
      // If multiple selection is needed, a different UI/form control setup is required.
      category: [null, Validators.required], // Single category for simplicity in form
      chassisId: ['', Validators.required],
      brand: ['', Validators.required],
      model: ['', Validators.required],
      hourlyPrice: [10.00, [Validators.required, Validators.min(0.01)]],
      status: [BicycleStatus.Available] // Default status for new bikes
    });
  }

  ngOnInit(): void {
    this.loadBicycles();
  }

  /**
   * Loads all bicycles from the backend.
   */
  loadBicycles(): void {
    // API call expects page and count. Using defaults for now.
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

  /**
   * Handles adding or updating a bicycle.
   */
  submitBicycleForm(): void {
    if (this.bicycleForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly.';
      this.bicycleForm.markAllAsTouched();
      return;
    }

    const formValue = this.bicycleForm.value;
    // Map the single category selected in the form to a Set for the API
    const categoriesAsStrings: string[] = formValue.category ? [formValue.category] : [];

    if (this.isEditing && this.selectedBicycle?.id) {
      const updateData: UpdateBicycle = {
        currentParkingLotName: formValue.currentParkingLotName,
        categories: categoriesAsStrings as BicycleCategory[], // Usa il Set
        status: formValue.status,
        brand: formValue.brand,
        model: formValue.model,
        hourlyPrice: formValue.hourlyPrice
      };

      // PATCH request
      this.http.patch<Bicycle>(`${this.API_URL}/bicycle/${this.selectedBicycle.id}`, updateData).subscribe({
        next: (updatedBicycle) => {
          if (this.bicycles) { // Added null check
            const index = this.bicycles.findIndex(b => b.id === updatedBicycle.id);
            if (index > -1) {
              this.bicycles[index] = updatedBicycle;
            }
          }
          this.cancelEdit();
          this.errorMessage = '';
        },
        error: (err) => {
          this.errorMessage = 'Failed to update bicycle.';
          console.error('Error updating bicycle:', err);
        }
      });
    } else {
      // Build CreateBicycle object
      const createData: CreateBicycle = {
        currentParkingLotName: formValue.currentParkingLotName,
        categories: categoriesAsStrings as BicycleCategory[], // Use the Set here
        chassisId: formValue.chassisId,
        brand: formValue.brand,
        model: formValue.model,
        hourlyPrice: formValue.hourlyPrice
      };

      // POST request
      this.http.post<Bicycle>(`${this.API_URL}/bicycle`, createData).subscribe({
        next: (newBicycle) => {
          this.bicycles?.push(newBicycle); // Added optional chaining
          this.bicycleForm.reset({ hourlyPrice: 10.00, status: BicycleStatus.Available }); // Reset with defaults
          this.errorMessage = '';
        },
        error: (err) => {
          this.errorMessage = 'Failed to add bicycle.';
          console.error('Error adding bicycle:', err);
        }
      });
    }
  }

  /**
   * Prepares the form for editing an existing bicycle.
   * @param bicycle The bicycle to edit.
   */
  editBicycle(bicycle: Bicycle): void {
    this.isEditing = true;
    this.selectedBicycle = bicycle;
    // Patch form values. If categories is a Set, convert to Array to get the first one for the single select.
    const categoryArray = bicycle.categories ? Array.from(bicycle.categories) : [];
    this.bicycleForm.patchValue({
      currentParkingLotName: bicycle.currentParkingLotName,
      category: categoryArray.length > 0 ? categoryArray[0] : null,
      chassisId: bicycle.chassisId,
      brand: bicycle.brand,
      model: bicycle.model,
      hourlyPrice: bicycle.hourlyPrice,
      status: bicycle.status // Add status for editing
    });
    // For chassisId, if it's not meant to be updated via PATCH, you might want to disable it
    // Or set it only during creation. Based on OpenAPI, it's only in CreateBicycle.
    if (this.isEditing) {
      this.bicycleForm.get('chassisId')?.disable();
    }
    this.errorMessage = '';
  }

  /**
   * Deletes a bicycle.
   * @param id The ID of the bicycle to delete.
   */
  deleteBicycle(id: string): void {
    if (confirm('Are you sure you want to delete this bicycle? This action cannot be undone.')) {
      this.http.delete(`${this.API_URL}/bicycle/${id}`).subscribe({
        next: () => {
          this.bicycles = this.bicycles?.filter(b => b.id !== id); // Added optional chaining
          this.errorMessage = '';
          if (this.selectedBicycle?.id === id) {
            this.cancelEdit();
          }
        },
        error: (err) => {
          this.errorMessage = 'Failed to delete bicycle.';
          console.error('Error deleting bicycle:', err);
        }
      });
    }
  }

  /**
   * Cancels the edit operation and resets the form.
   */
  cancelEdit(): void {
    this.isEditing = false;
    this.selectedBicycle = null;
    this.bicycleForm.reset({
      hourlyPrice: 10.00,
      status: BicycleStatus.Available,
      category: null // Reset category selection
    });
    this.bicycleForm.get('chassisId')?.enable(); // Re-enable chassisId for new creation
    this.errorMessage = '';
  }
}
