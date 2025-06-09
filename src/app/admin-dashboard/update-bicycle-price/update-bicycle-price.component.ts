import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Assicurati che sia importato

// Importa i servizi e i modelli generati da OpenAPI Generator
import { BicycleService} from '../../../gen/bikehub';
import { Bicycle, UpdateBicycle } from '../../../gen/bikehub';
// Potrebbe essere utile importare anche l'interfaccia ErrorResponse se generata
// import { ErrorResponse } from '../../api/model/errorResponse'; // Se l'hai generata

@Component({
  selector: 'app-update-bicycle-price',
  standalone: true, // Se il componente è standalone, altrimenti rimuovi
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './update-bicycle-price.component.html',
  styleUrls: ['./update-bicycle-price.component.css']
})
export class UpdateBicyclePriceComponent implements OnInit {
  updatePriceForm: FormGroup;
  bicycleIdFromRoute: string | null = null; // ID se viene dalla rotta
  currentHourlyPrice: number | null = null;
  loadingDetails = false; // Nuovo stato per il caricamento dei dettagli
  loadingUpdate = false;  // Nuovo stato per l'aggiornamento
  successMessage: string | null = null;
  errorMessage: string | null = null;
  bicycleFound: boolean = false; // Per tenere traccia se la bicicletta è stata trovata

  constructor(
    private fb: FormBuilder,
    private bicycleService: BicycleService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.updatePriceForm = this.fb.group({
      // Il campo bicycleId sarà editabile dall'utente se non passato da rotta
      bicycleId: ['', [Validators.required, Validators.pattern(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)]], // Aggiungi validatore UUID
      hourlyPrice: [{ value: null, disabled: true }, [Validators.required, Validators.min(0.01)]] // Inizialmente disabilitato
    });
  }

  ngOnInit(): void {
    // Tenta di recuperare l'ID della bicicletta dalla rotta
    this.route.paramMap.subscribe(params => {
      this.bicycleIdFromRoute = params.get('bicycleId');
      if (this.bicycleIdFromRoute) {
        this.updatePriceForm.get('bicycleId')?.setValue(this.bicycleIdFromRoute);
        this.updatePriceForm.get('bicycleId')?.disable(); // Se viene dalla rotta, non è modificabile
        this.loadBicycleDetails(); // Carica i dettagli automaticamente se l'ID è nella rotta
      }
    });
  }

  // Nuovo metodo per gestire l'azione di caricamento dei dettagli
  loadBicycleDetails(): void {
    this.successMessage = null;
    this.errorMessage = null;
    this.bicycleFound = false; // Reset dello stato

    const idToLoad = this.bicycleIdFromRoute || this.updatePriceForm.get('bicycleId')?.value;

    if (!idToLoad || this.updatePriceForm.get('bicycleId')?.invalid) {
      this.errorMessage = 'Inserisci un ID bicicletta valido prima di caricare i dettagli.';
      return;
    }

    this.loadingDetails = true; // Imposta lo stato di caricamento per i dettagli
    this.currentHourlyPrice = null; // Resetta il prezzo corrente

    this.bicycleService.retrieveBicycle(idToLoad).subscribe({
      next: (bicycle: Bicycle) => {
        this.currentHourlyPrice = bicycle.hourlyPrice;
        this.updatePriceForm.get('hourlyPrice')?.enable(); // Abilita il campo prezzo
        this.updatePriceForm.get('hourlyPrice')?.setValue(bicycle.hourlyPrice); // Pre-popola il prezzo
        this.bicycleFound = true; // Bicicletta trovata
        this.successMessage = 'Dettagli bicicletta caricati con successo.';
        this.loadingDetails = false;
      },
      error: (err: any) => { // Usa 'any' se ErrorResponse non è accessibile o definito
        this.updatePriceForm.get('hourlyPrice')?.disable(); // Disabilita il campo prezzo in caso di errore
        this.updatePriceForm.get('hourlyPrice')?.setValue(null); // Resetta il valore

        this.bicycleFound = false; // Bicicletta non trovata
        this.loadingDetails = false;

        // Migliore gestione dell'errore HTTP 404
        if (err && err.status === 404) {
          this.errorMessage = `Bicicletta con ID '${idToLoad}' non trovata. Controlla l'ID e riprova.`;
        } else if (err && err.error && err.error.message) {
          // Se la risposta di errore del backend ha un campo 'message'
          this.errorMessage = `Errore nel caricamento: ${err.error.message}`;
        } else {
          // Errore generico
          this.errorMessage = 'Si è verificato un errore durante il caricamento dei dettagli della bicicletta.';
        }
        console.error('Errore nel recupero della bicicletta:', err);
      }
    });
  }

  onSubmit(): void {
    this.successMessage = null;
    this.errorMessage = null;

    const idToUpdate = this.bicycleIdFromRoute || this.updatePriceForm.get('bicycleId')?.value;

    if (!idToUpdate || this.updatePriceForm.get('bicycleId')?.invalid) {
      this.errorMessage = 'L\'ID della bicicletta è mancante o non valido.';
      return;
    }

    if (this.updatePriceForm.get('hourlyPrice')?.invalid || !this.bicycleFound) {
      // Se la bicicletta non è stata trovata o il prezzo non è valido
      this.errorMessage = 'Impossibile procedere. Carica prima i dettagli della bicicletta e inserisci un prezzo valido.';
      return;
    }


    this.loadingUpdate = true; // Imposta lo stato di caricamento per l'aggiornamento
    const newHourlyPrice: number = this.updatePriceForm.get('hourlyPrice')?.value;

    const updateData: UpdateBicycle = {
      hourlyPrice: newHourlyPrice
    };

    this.bicycleService.updateBicycle(idToUpdate, updateData).subscribe({
      next: (updatedBicycle: Bicycle) => {
        this.successMessage = `Tariffa oraria per la bicicletta ${updatedBicycle.id} aggiornata con successo a ${updatedBicycle.hourlyPrice}€/ora.`;
        this.currentHourlyPrice = updatedBicycle.hourlyPrice;
        this.loadingUpdate = false;
        // Opzionalmente ricarica i dettagli per aggiornare lo stato in caso di ulteriori modifiche
        // this.loadBicycleDetails();
      },
      error: (err: any) => {
        this.loadingUpdate = false;
        if (err && err.error && err.error.message) {
          this.errorMessage = `Errore nell'aggiornamento: ${err.error.message}`;
        } else {
          this.errorMessage = 'Si è verificato un errore durante l\'aggiornamento della tariffa.';
        }
        console.error('Errore nell\'aggiornamento della tariffa:', err);
      }
    });
  }
}
