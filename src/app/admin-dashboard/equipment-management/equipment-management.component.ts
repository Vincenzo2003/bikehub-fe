import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CurrencyPipe, NgClass} from '@angular/common';
import {CreateEquipment, Equipment, EquipmentsPage,} from '../../../gen/bikehub';
import {HttpClient, HttpParams} from '@angular/common/http';
import {AddEquipmentModalComponent} from './add-equipment-modal/add-equipment-modal.component';

@Component({
  selector: 'app-equipment-management',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AddEquipmentModalComponent
  ],
  templateUrl: './equipment-management.component.html',
  styleUrl: './equipment-management.component.css'
})
export class EquipmentManagementComponent {
  equipments: Array<Equipment> | undefined = [];
  equipmentForm: FormGroup;
  errorMessage: string = '';
  showAddEquipmentModal: boolean = false;
  private readonly API_URL = 'http://localhost:8080';

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.equipmentForm = this.fb.group({
      bicycleId: ['', Validators.required],
      type: [null, Validators.required],
      name: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadEquipments();
  }

  loadEquipments(): void {
    const params = new HttpParams()
      .set('page', 0)
      .set('count', 50);

    this.http.get<EquipmentsPage>(`${this.API_URL}/equipments`, { params }).subscribe({
      next: (response) => {
        this.equipments = response.results;
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = 'Failed to load equipments. Ensure backend is running and you are logged in as admin.';
        console.error('Error loading equipments:', err);
      }
    });
  }

  openAddEquipmentModal(): void {
    this.showAddEquipmentModal = true;
    this.errorMessage = '';
  }

  closeAddEquipmentModal(): void {
    this.showAddEquipmentModal = false;
    this.errorMessage = '';
  }

  handleAddEquipment(newEquipmentData: any): void {
    const createData: CreateEquipment = {
      bicycleId: newEquipmentData.bicycleId,
      type: newEquipmentData.type,
      name: newEquipmentData.name,
      description: newEquipmentData.description,
    };

    this.http.post<Equipment>(`${this.API_URL}/equipment`, createData).subscribe({
      next: (newEquipment) => {
        console.log('Equipment added successfully:', newEquipment);
        this.closeAddEquipmentModal();
        this.loadEquipments();
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Error adding Equipment:', err);
        this.errorMessage = err.error?.message || 'Failed to add Equipment. Please check the data.';
      }
    });
  }

}
