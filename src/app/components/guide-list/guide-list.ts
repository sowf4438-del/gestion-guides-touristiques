import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GuideTouristique, StatutGuide, REGIONS, STATUTS } from '../../models/guide-touristique';
import { GuideService } from '../../services/guide';

export interface CarteOrientation {
  id: 'dispos' | 'top-notes' | 'dakar' | 'ziguinchor';
  titre: string;
  description: string;
  compteur$: Observable<number>;
  action: () => void;
  active: boolean;
}

@Component({
  selector: 'app-guide-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guide-list.html',
  styleUrl: './guide-list.css'
})
export class GuideListComponent implements OnInit {
  @Output() modifierGuide = new EventEmitter<GuideTouristique>();
  @Output() guideSupprime = new EventEmitter<GuideTouristique>();

  recherche = '';
  regionSelectionnee = 'Toutes';
  statutSelectionne: 'Tous' | StatutGuide = 'Tous';
  filtreNoteMin = 0;

  regions: string[] = ['Toutes', ...REGIONS];
  statuts: ('Tous' | StatutGuide)[] = ['Tous', ...STATUTS];

  private rechercheSubject = new BehaviorSubject<string>('');
  private regionSubject = new BehaviorSubject<string>('Toutes');
  private statutSubject = new BehaviorSubject<'Tous' | StatutGuide>('Tous');
  private noteMinSubject = new BehaviorSubject<number>(0);

  guidesFiltres$!: Observable<GuideTouristique[]>;
  totalGuides$!: Observable<number>;
  cartesOrientation: CarteOrientation[] = [];

  constructor(private guideService: GuideService) {}

  ngOnInit(): void {
    this.totalGuides$ = this.guideService.guides$.pipe(map((guides) => guides.length));

    this.cartesOrientation = [
      {
        id: 'dispos',
        titre: 'Disponibles maintenant',
        description: 'Affectation immédiate par région',
        compteur$: this.guideService.guides$.pipe(
          map((guides) => guides.filter((g) => g.statut === 'Disponible').length)
        ),
        action: () => this.basculerStatut('Disponible'),
        active: false
      },
      {
        id: 'top-notes',
        titre: 'Mieux notés (4,5+)',
        description: 'Références les mieux évaluées',
        compteur$: this.guideService.guides$.pipe(
          map((guides) => guides.filter((g) => g.note >= 4.5).length)
        ),
        action: () => this.basculerFiltreNoteMin(4.5),
        active: false
      },
      {
        id: 'dakar',
        titre: 'Pôle Dakar',
        description: 'Accès rapide aux guides de Dakar',
        compteur$: this.guideService.guides$.pipe(
          map((guides) => guides.filter((g) => g.region === 'Dakar').length)
        ),
        action: () => this.basculerRegion('Dakar'),
        active: false
      },
      {
        id: 'ziguinchor',
        titre: 'Casamance (Ziguinchor)',
        description: 'Repère rapide sud du pays',
        compteur$: this.guideService.guides$.pipe(
          map((guides) => guides.filter((g) => g.region === 'Ziguinchor').length)
        ),
        action: () => this.basculerRegion('Ziguinchor'),
        active: false
      }
    ];

    this.guidesFiltres$ = combineLatest([
      this.guideService.guides$,
      this.rechercheSubject,
      this.regionSubject,
      this.statutSubject,
      this.noteMinSubject
    ]).pipe(
      map(([guides, recherche, region, statut, noteMin]) => {
        const q = this.normaliser(recherche);
        return guides.filter((guide) => {
          const texte = this.normaliser(`${guide.prenom} ${guide.nom} ${guide.specialite}`);
          return (
            texte.includes(q) &&
            (region === 'Toutes' || guide.region === region) &&
            (statut === 'Tous' || guide.statut === statut) &&
            guide.note >= noteMin
          );
        });
      })
    );
  }

  private normaliser(texte: string): string {
    return texte
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  // Met à jour les cartes sans les recréer (évite de relancer leurs compteurs)
  private mettreAJourCartesActives(): void {
    for (const carte of this.cartesOrientation) {
      carte.active =
        (carte.id === 'dispos' && this.statutSelectionne === 'Disponible') ||
        (carte.id === 'top-notes' && this.filtreNoteMin === 4.5) ||
        (carte.id === 'dakar' && this.regionSelectionnee === 'Dakar') ||
        (carte.id === 'ziguinchor' && this.regionSelectionnee === 'Ziguinchor');
    }
  }

  onRechercheChange(valeur: string): void {
    this.recherche = valeur;
    this.rechercheSubject.next(valeur);
  }

  onRegionChange(region: string): void {
    this.regionSelectionnee = region;
    this.regionSubject.next(region);
    this.mettreAJourCartesActives();
  }

  basculerRegion(region: string): void {
    this.onRegionChange(this.regionSelectionnee === region ? 'Toutes' : region);
  }

  onStatutChange(statut: 'Tous' | StatutGuide): void {
    this.statutSelectionne = statut;
    this.statutSubject.next(statut);
    this.mettreAJourCartesActives();
  }

  basculerStatut(statut: StatutGuide): void {
    this.onStatutChange(this.statutSelectionne === statut ? 'Tous' : statut);
  }

  basculerFiltreNoteMin(note: number): void {
    this.filtreNoteMin = this.filtreNoteMin === note ? 0 : note;
    this.noteMinSubject.next(this.filtreNoteMin);
    this.mettreAJourCartesActives();
  }

  reinitialiserFiltres(): void {
    this.onRechercheChange('');
    this.onRegionChange('Toutes');
    this.onStatutChange('Tous');
    this.filtreNoteMin = 0;
    this.noteMinSubject.next(0);
    this.mettreAJourCartesActives();
  }

  editerGuide(guide: GuideTouristique): void {
    this.modifierGuide.emit(guide);
  }

  supprimerGuide(guide: GuideTouristique): void {
    const confirme = window.confirm(
      `Confirmer la suppression du guide ${guide.prenom} ${guide.nom} (${guide.region}) ?`
    );
    if (!confirme) {
      return;
    }
    const resultat = this.guideService.deleteGuide(guide.id);
    if (resultat.succes) {
      this.guideSupprime.emit(guide);
    }
  }
}