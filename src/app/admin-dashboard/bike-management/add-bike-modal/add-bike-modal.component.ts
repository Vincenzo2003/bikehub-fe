// src/app/admin-dashboard/bike-management/add-bike-modal/add-bike-modal.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-bike-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-bike-modal.component.html',
  styleUrl: './add-bike-modal.component.css'
})
export class AddBikeModalComponent implements OnInit {
  @Input() bicycleCategories: string[] = []; // Riceve le categorie dal padre
  @Output() closeModalEvent = new EventEmitter<void>(); // Emette quando la modale deve chiudersi
  @Output() addBikeEvent = new EventEmitter<any>(); // Emette i dati della nuova bici

  bicycleForm!: FormGroup;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.bicycleForm = this.fb.group({
      currentParkingLotName: ['', Validators.required],
      categories: [[], Validators.required],
      chassisId: ['', Validators.required],
      brand: ['', Validators.required],
      model: ['', Validators.required],
      hourlyPrice: ['', [Validators.required, Validators.min(0.01)]],
    });
  }

  closeModal(): void {
    this.closeModalEvent.emit();
  }

  submitBicycleForm(): void {
    if (this.bicycleForm.valid) {
      this.addBikeEvent.emit(this.bicycleForm.value);
    } else {
      this.bicycleForm.markAllAsTouched(); // Mostra errori di validazione
    }
  }

  setErrorMessage(message: string) {
    this.errorMessage = message;
  }

}
