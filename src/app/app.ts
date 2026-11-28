import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, map } from 'rxjs';
import { GuideListComponent } from './components/guide-list/guide-list';
import { GuideForm } from './components/guide-form/guide-form';
import { GuideService } from './services/guide';
import { GuideTouristique } from './models/guide-touristique';

export interface StatsGuides {
  total: number;
  disponibles: number;
  enMission: number;
  indisponibles: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, GuideListComponent, GuideForm],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  guideSelectionne: GuideTouristique | null = null;
  messageNotification: string | null = null;
  private timerNotification: ReturnType<typeof setTimeout> | null = null;
  stats$: Observable<StatsGuides>;

  constructor(private guideService: GuideService) {
    this.stats$ = this.guideService.guides$.pipe(
      map((guides) => ({
        total: guides.length,
        disponibles: guides.filter((g) => g.statut === 'Disponible').length,
        enMission: guides.filter((g) => g.statut === 'En mission').length,
        indisponibles: guides.filter((g) => g.statut === 'Indisponible').length
      }))
    );
  }

  selectionnerPourEdition(guide: GuideTouristique): void {
    this.guideSelectionne = { ...guide };
    if (typeof document !== 'undefined') {
      document
        .getElementById('section-formulaire')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onEditionTerminee(enregistre: boolean): void {
    this.guideSelectionne = null;
    if (enregistre) {
      this.afficherNotification('Fiche mise à jour avec succès.');
    }
  }

  onGuideSupprime(guide: GuideTouristique): void {
    if (this.guideSelectionne?.id === guide.id) {
      this.guideSelectionne = null;
    }
    this.afficherNotification(`Le guide ${guide.prenom} ${guide.nom} a été supprimé.`);
  }

  reinitialiserDemo(): void {
    const resultat = this.guideService.reinitialiserDonneesDemo();
    this.guideSelectionne = null;
    this.afficherNotification(resultat.message);
  }

  private afficherNotification(texte: string): void {
    this.messageNotification = texte;
    if (this.timerNotification) {
      clearTimeout(this.timerNotification);
    }
    this.timerNotification = setTimeout(() => {
      this.messageNotification = null;
    }, 3500);
  }
}