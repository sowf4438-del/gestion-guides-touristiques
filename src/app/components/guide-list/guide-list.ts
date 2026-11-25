import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GuideTouristique, StatutGuide } from '../../models/guide-touristique';
import { GuideService } from '../../services/guide';

@Component({
  selector: 'app-guide-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guide-list.html',
  styleUrl: './guide-list.css'
})
export class GuideListComponent implements OnInit {
  @Output() modifierGuide = new EventEmitter<GuideTouristique>();

  recherche = '';
  regionSelectionnee = 'Toutes';
  statutSelectionne: 'Tous' | StatutGuide = 'Tous';

  regions: string[] = [
    'Toutes',
    'Dakar',
    'Diourbel',
    'Fatick',
    'Kaffrine',
    'Kaolack',
    'Kédougou',
    'Kolda',
    'Louga',
    'Matam',
    'Saint-Louis',
    'Sédhiou',
    'Tambacounda',
    'Thiès',
    'Ziguinchor'
  ];

  statuts: ('Tous' | StatutGuide)[] = [
    'Tous',
    'Disponible',
    'En mission',
    'Indisponible'
  ];

  private rechercheSubject = new BehaviorSubject<string>('');
  private regionSubject = new BehaviorSubject<string>('Toutes');
  private statutSubject = new BehaviorSubject<'Tous' | StatutGuide>('Tous');

  guidesFiltres$!: Observable<GuideTouristique[]>;

  constructor(private guideService: GuideService) {}

  ngOnInit(): void {
    this.guidesFiltres$ = combineLatest([
      this.guideService.guides$,
      this.rechercheSubject.asObservable(),
      this.regionSubject.asObservable(),
      this.statutSubject.asObservable()
    ]).pipe(
      map(([guides, recherche, region, statut]) => {
        const q = this.normaliser(recherche);
        return guides.filter((guide) => {
          const texte = this.normaliser(`${guide.prenom} ${guide.nom} ${guide.specialite}`);
          const matchRecherche = texte.includes(q);
          const matchRegion = region === 'Toutes' || guide.region === region;
          const matchStatut = statut === 'Tous' || guide.statut === statut;
          return matchRecherche && matchRegion && matchStatut;
        });
      })
    );
  }

  // Minuscules et sans accents : "ecotourisme" trouve "Écotourisme"
  private normaliser(texte: string): string {
    return texte
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  onRechercheChange(valeur: string): void {
    this.recherche = valeur;
    this.rechercheSubject.next(valeur);
  }

  onRegionChange(region: string): void {
    this.regionSelectionnee = region;
    this.regionSubject.next(region);
  }

  onStatutChange(statut: 'Tous' | StatutGuide): void {
    this.statutSelectionne = statut;
    this.statutSubject.next(statut);
  }

  reinitialiserFiltres(): void {
    this.onRechercheChange('');
    this.onRegionChange('Toutes');
    this.onStatutChange('Tous');
  }

  editerGuide(guide: GuideTouristique): void {
    this.modifierGuide.emit(guide);
  }

  supprimerGuide(id: number): void {
    this.guideService.deleteGuide(id);
  }
}