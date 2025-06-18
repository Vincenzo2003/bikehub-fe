
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
  @Input() bicycleCategories: string[] = [];
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() addBikeEvent = new EventEmitter<any>();

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
      this.bicycleForm.markAllAsTouched();
    }
  }

  setErrorMessage(message: string) {
    this.errorMessage = message;
  }

}
