import { Component, OnInit } from '@angular/core';
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

  private regionSubject = new BehaviorSubject<string>('Toutes');
  private statutSubject = new BehaviorSubject<'Tous' | StatutGuide>('Tous');

  guidesFiltres$!: Observable<GuideTouristique[]>;

  constructor(private guideService: GuideService) {}

  ngOnInit(): void {
    this.guidesFiltres$ = combineLatest([
      this.guideService.guides$,
      this.regionSubject.asObservable(),
      this.statutSubject.asObservable()
    ]).pipe(
      map(([guides, region, statut]) =>
        guides.filter((guide) => {
          const matchRegion = region === 'Toutes' || guide.region === region;
          const matchStatut = statut === 'Tous' || guide.statut === statut;
          return matchRegion && matchStatut;
        })
      )
    );
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
    this.onRegionChange('Toutes');
    this.onStatutChange('Tous');
  }

  supprimerGuide(id: number): void {
    this.guideService.deleteGuide(id);
  }
}