import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import {
  BicycleCategory,
  Stats,
  StatisticsService
} from '../../../gen/bikehub';

@Component({
  selector: 'app-stats-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stats-dashboard.component.html',
  styleUrls: ['./stats-dashboard.component.css'],
})
export class StatsDashboardComponent implements OnInit {

  bicycleId: string = '';
  bicycleStats: Stats | null = null;
  loadingBicycleStats: boolean = false;
  errorBicycleStats: string | null = null;



  selectedCategory: BicycleCategory | null = null;
  categoryStats: Stats | null = null;
  loadingCategoryStats: boolean = false;
  errorCategoryStats: string | null = null;


  // Elenco delle categorie disponibili (dal tuo OpenAPI)
  bicycleCategories: BicycleCategory[] = Object.values(BicycleCategory);

  constructor(private statisticsService: StatisticsService) {}

  ngOnInit(): void {}

  // Helper per validare l'UUID (non strettamente necessario, ma utile per feedback frontend)
  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // Recupera le statistiche per una bicicletta specifica
  getBicycleStats(): void {
    // Reset dello stato all'inizio di ogni chiamata
    this.bicycleStats = null;
    this.errorBicycleStats = null;

    if (!this.bicycleId.trim()) {
      this.errorBicycleStats = "Please enter a Bicycle ID.";
      return;
    }

    // Aggiungi una validazione frontend per l'UUID
    if (!this.isValidUUID(this.bicycleId.trim())) {
      this.errorBicycleStats = "Invalid Bicycle ID format. Please enter a valid UUID.";
      return;
    }


    this.loadingBicycleStats = true;

    this.statisticsService.retrieveBicycleStats(this.bicycleId.trim()).subscribe({
      next: (stats) => {
        if (stats && stats.usagePercentage !== undefined && stats.usagePercentage !== null) {
          this.bicycleStats = stats;
        } else {
          // Caso in cui il backend restituisce successo ma usagePercentage è nullo
          this.errorBicycleStats = "Usage percentage not available for this bicycle.";
        }
        this.loadingBicycleStats = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching bicycle stats:', err);
        this.loadingBicycleStats = false;

        if (err.status === 400) {
          // Gestione specifica per errore 400 (Bad Request)
          // Il backend potrebbe restituire un messaggio d'errore nel corpo della risposta
          const errorMessage = err.error?.message || 'Invalid input provided. Please check the Bicycle ID format.';
          this.errorBicycleStats = `Error 400: ${errorMessage}`;
        } else if (err.status === 404) {
          // Gestione per errore 404 (Not Found)
          this.errorBicycleStats = "Bicycle not found with the provided ID.";
        } else if (err.status === 401) {
          // Gestione per errore 401 (Unauthorized)
          this.errorBicycleStats = "Authentication required or invalid. Please log in.";
        } else {
          // Gestione errori generici del server
          this.errorBicycleStats =
            err.message || "Failed to fetch bicycle statistics. Please try again.";
        }
      },
    });
  }

  // Recupera le statistiche per una categoria specifica
  getCategoryStats(): void {
    // Reset dello stato all'inizio di ogni chiamata
    this.categoryStats = null;
    this.errorCategoryStats = null;

    if (!this.selectedCategory) {
      this.errorCategoryStats = "Please select a category.";
      return;
    }

    this.loadingCategoryStats = true;

    this.statisticsService
      .retrieveCategoryStats(this.selectedCategory)
      .subscribe({
        next: (stats) => {
          if (stats && stats.usagePercentage !== undefined && stats.usagePercentage !== null) {
            this.categoryStats = stats;
          } else {
            // Caso in cui il backend restituisce successo ma usagePercentage è nullo
            this.errorCategoryStats = "Usage percentage not available for this category.";
          }
          this.loadingCategoryStats = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error fetching category stats:', err);
          this.loadingCategoryStats = false;

          if (err.status === 400) {
            const errorMessage = err.error?.message || 'Invalid category requested.';
            this.errorCategoryStats = `Error 400: ${errorMessage}`;
          } else if (err.status === 401) {
            this.errorCategoryStats = "Authentication required or invalid. Please log in.";
          } else {
            this.errorCategoryStats =
              err.message || "Failed to fetch category statistics. Please try again.";
          }
        },
      });
  }
}
