import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {EquipmentType} from '../../../../gen/bikehub';

@Component({
  selector: 'app-add-equipment-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-equipment-modal.component.html',
  styleUrl: './add-equipment-modal.component.css'
})
export class AddEquipmentModalComponent implements OnInit {
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() addEquipmentEvent = new EventEmitter<any>();

  equipmentForm!: FormGroup;
  errorMessage: string | null = null;

  equipmentTypes = Object.values(EquipmentType);

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.equipmentForm = this.fb.group({
      bicycleId: ['', Validators.required],
      type: ['', Validators.required],
      name: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  closeModal(): void {
    this.closeModalEvent.emit();
  }

  submitEquipmentForm(): void {
    if (this.equipmentForm.valid) {
      this.addEquipmentEvent.emit(this.equipmentForm.value);
    } else {
      this.equipmentForm.markAllAsTouched(); // Mostra errori di validazione
    }
  }

  setErrorMessage(message: string) {
    this.errorMessage = message;
  }

}
