import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms'; // Importa anche FormControl e AbstractControl
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, switchMap } from 'rxjs';

// Importa i modelli e il servizio generati
import {
  ApiModule,
  CreatePaymentMethod,
  PaymentMethod,
  PaymentMethodService,
  PaymentService,
  PaymentType,
  UpdatePaymentMethod
} from '../../../gen/bikehub';

@Component({
  selector: 'app-payment-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ApiModule // Importa il modulo API generato
  ],
  templateUrl: './payment-management.component.html',
  styleUrls: ['./payment-management.component.css']
})
export class PaymentManagementComponent implements OnInit {
  paymentForm: FormGroup;
  paymentTypes = Object.values(PaymentType).filter(type => type !== PaymentType.Cash);

  paymentMethods$: Observable<PaymentMethod[]>;
  private refreshPaymentMethods = new BehaviorSubject<boolean>(true);

  // Variabili per il modale di modifica
  isEditModalOpen: boolean = false;
  currentEditingPaymentMethod: PaymentMethod | null = null;
  editPaymentForm!: FormGroup; // Form per la modifica nel modale

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private paymentMethodService: PaymentMethodService
) {
    // Form per l'aggiunta di un nuovo metodo di pagamento
    // Validazione semplificata: solo "required"
    this.paymentForm = this.fb.group({
      type: ['', Validators.required],
      cc: ['', Validators.required],
      cvc: ['', Validators.required],
      holder: ['', Validators.required],
      expireAt: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]] // MM/YY
    });

    // Osservabile per caricare i metodi di pagamento ogni volta che `refreshPaymentMethods` emette un valore
    this.paymentMethods$ = this.refreshPaymentMethods.pipe(
      switchMap(() => this.paymentService.retrievePaymentMethods())
    );
  }

  ngOnInit(): void {
    this.loadPaymentMethods(); // Carica i metodi all'avvio
  }

  // --- Getter per i controlli del form di aggiunta (paymentForm) ---
  get typeControl(): FormControl {
    return this.paymentForm.get('type') as FormControl;
  }
  get ccControl(): FormControl {
    return this.paymentForm.get('cc') as FormControl;
  }
  get cvcControl(): FormControl {
    return this.paymentForm.get('cvc') as FormControl;
  }
  get holderControl(): FormControl {
    return this.paymentForm.get('holder') as FormControl;
  }
  get expireAtControl(): FormControl {
    return this.paymentForm.get('expireAt') as FormControl;
  }

  // --- Getter per i controlli del form di modifica (editPaymentForm) ---
  // Nota: questi getter saranno disponibili solo quando editPaymentForm è inizializzato (i.e. isEditModalOpen è true)
  get editTypeControl(): FormControl {
    return this.editPaymentForm.get('type') as FormControl;
  }
  get editCcControl(): FormControl {
    return this.editPaymentForm.get('cc') as FormControl;
  }
  get editCvcControl(): FormControl {
    return this.editPaymentForm.get('cvc') as FormControl;
  }
  get editHolderControl(): FormControl {
    return this.editPaymentForm.get('holder') as FormControl;
  }
  get editExpireAtControl(): FormControl {
    return this.editPaymentForm.get('expireAt') as FormControl;
  }

  // Carica/ricarica i metodi di pagamento
  loadPaymentMethods(): void {
    this.refreshPaymentMethods.next(true);
  }

  // Gestisce l'invio del form per aggiungere un nuovo metodo
  onSubmit(): void {
    // Controlla solo che i campi siano compilati
    if (this.paymentForm.valid) {
      const formValue = this.paymentForm.value;
      const [month, year] = formValue.expireAt.split('/');
      // Converte la data in formato YYYY-MM-DD (es. 2025-06-01)
      const expireDate = `20${year}-${month}-01`;

      // Prepara i dati come richiesto dal backend, senza validazione frontend sul formato specifico
      const newPaymentMethod: CreatePaymentMethod = {
        type: formValue.type,
        cc: formValue.cc,
        cvc: formValue.cvc,
        holder: formValue.holder,
        expireAt: expireDate // Invia la data così come è stata inserita (MM/YY)
      };

      this.paymentService.createPaymentMethod(newPaymentMethod).subscribe({
        next: () => {
          alert('Metodo di pagamento aggiunto con successo!');
          this.paymentForm.reset(); // Resetta il form dopo l'aggiunta
          this.loadPaymentMethods(); // Aggiorna la lista
        },
        error: (error: HttpErrorResponse) => {
          let errorMessage = 'Errore durante l\'aggiunta del metodo di pagamento.';
          // Se è un errore 400 e c'è un messaggio specifico dal backend
          if (error.status === 400 && error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          alert(errorMessage);
          console.error('Errore durante l\'aggiunta del metodo di pagamento:', error);
        }
      });
    } else {
      alert('Per favore, compila tutti i campi obbligatori.');
    }
  }

  // Apre il modale di modifica con i dati del metodo selezionato
  openEditModal(paymentMethod: PaymentMethod): void {
    this.currentEditingPaymentMethod = { ...paymentMethod }; // Crea una copia per la modifica
    this.isEditModalOpen = true;

    // Inizializza il form di modifica nel modale con i dati attuali
    // Validazione semplificata: solo "required"
    this.editPaymentForm = this.fb.group({
      type: [this.currentEditingPaymentMethod.type, Validators.required],
      cc: [this.currentEditingPaymentMethod.cc, Validators.required],
      cvc: [this.currentEditingPaymentMethod.cvc, Validators.required],
      holder: [this.currentEditingPaymentMethod.holder, Validators.required],
      expireAt: [this.formatExpireDateForForm(this.currentEditingPaymentMethod.expireAt), Validators.required]
    });
  }

  // Chiude il modale di modifica
  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.currentEditingPaymentMethod = null;
  }

  // Salva le modifiche dal modale
  saveEditedPaymentMethod(): void {
    // Controlla solo che i campi siano compilati
    if (this.editPaymentForm.valid && this.currentEditingPaymentMethod) {
      const formValue = this.editPaymentForm.value;
      const [month, year] = formValue.expireAt.split('/');
      // Converte la data in formato YYYY-MM-DD (es. 2025-06-01)
      const expireDate = `20${year}-${month}-01`;
      // Invia la data così com'è (MM/YY) se il backend la gestisce
      const updatedPaymentMethod: UpdatePaymentMethod = {
        type: formValue.type,
        cc: formValue.cc,
        cvc: formValue.cvc,
        holder: formValue.holder,
        expireAt: expireDate // Invia la data così come è stata inserita (MM/YY)
      };

      this.paymentMethodService.updatePaymentMethod(this.currentEditingPaymentMethod.id!, updatedPaymentMethod).subscribe({
        next: () => {
          alert('Metodo di pagamento aggiornato con successo!');
          this.closeEditModal(); // Chiude il modale
          this.loadPaymentMethods(); // Aggiorna la lista
        },
        error: (error: HttpErrorResponse) => {
          let errorMessage = 'Errore durante l\'aggiornamento del metodo di pagamento.';
          // Se è un errore 400 e c'è un messaggio specifico dal backend
          if (error.status === 400 && error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          alert(errorMessage);
          console.error('Errore durante l\'aggiornamento del metodo di pagamento:', error);
        }
      });
    } else {
      alert('Per favore, compila tutti i campi obbligatori nel modulo di modifica.');
    }
  }

  // Elimina un metodo di pagamento
  deletePaymentMethod(id: string): void {
    if (confirm('Sei sicuro di voler eliminare questo metodo di pagamento?')) {
      this.paymentMethodService.deletePaymentMethod(id).subscribe({
        next: () => {
          alert('Metodo di pagamento eliminato con successo!');
          this.loadPaymentMethods(); // Aggiorna la lista
        },
        error: (error: HttpErrorResponse) => {
          let errorMessage = 'Errore durante l\'eliminazione del metodo di pagamento.';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          alert(errorMessage);
          console.error('Errore durante l\'eliminazione del metodo di pagamento:', error);
        }
      });
    }
  }

  // Funzione utility per mascherare il numero della carta (**** **** **** 1234)
  maskCreditCard(cc: string | undefined): string {
    return cc ? '**** **** **** ' + cc.slice(-4) : '';
  }

  // Funzione utility per formattare la data di scadenza (MM/YY) per la tabella e il form
  formatExpireDate(dateString: string | undefined): string {
    if (!dateString) return '';
    // Se la data dal backend è già in MM/YY, la usa direttamente
    if (dateString.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      return dateString;
    }
    // Altrimenti, prova a formattarla da un formato data ISO (es. 2025-06-01)
    const date = new Date(dateString);
    if (isNaN(date.getTime())) { // Se la data non è valida
      return dateString; // Restituisce la stringa originale
    }
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${year}`;
  }

  // Funzione utility per formattare la data di scadenza per il campo del form (MM/YY)
  private formatExpireDateForForm(dateString: string | undefined): string {
    return this.formatExpireDate(dateString);
  }
}
