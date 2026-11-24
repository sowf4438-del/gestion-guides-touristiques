import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GuideTouristique } from '../models/guide-touristique';

@Injectable({
  providedIn: 'root'
})
export class GuideService {
  private guidesInitiaux: GuideTouristique[] = [
    {
      id: 1,
      nom: 'KANE',
      prenom: 'Assane',
      specialite: 'Écotourisme et mangroves',
      region: 'Ziguinchor',
      telephone: '+221 77 123 45 01',
      email: 'm.kane.exemple@tourisme-sn.org',
      note: 4.8,
      statut: 'Disponible'
    },
    {
      id: 2,
      nom: 'SOW',
      prenom: 'Fatima',
      specialite: 'Histoire et patrimoine',
      region: 'Saint-Louis',
      telephone: '+221 77 123 45 02',
      email: 'f.sowexemple@tourisme-sn.org',
      note: 4.5,
      statut: 'En mission'
    },
    {
      id: 3,
      nom: 'Fall',
      prenom: 'Ousmane',
      specialite: 'Culture urbaine et musées',
      region: 'Dakar',
      telephone: '+221 77 123 45 03',
      email: 'o.fall.exemple@tourisme-sn.org',
      note: 4.2,
      statut: 'Disponible'
    },
    {
      id: 4,
      nom: 'Sarr',
      prenom: 'Khady',
      specialite: 'Littoral et réserve naturelle',
      region: 'Thiès',
      telephone: '+221 77 123 45 04',
      email: 'k.sarr.exemple@tourisme-sn.org',
      note: 3.9,
      statut: 'Indisponible'
    }
  ];

  private guidesSubject = new BehaviorSubject<GuideTouristique[]>(this.guidesInitiaux);
  guides$: Observable<GuideTouristique[]> = this.guidesSubject.asObservable();

  getGuides(): GuideTouristique[] {
    return this.guidesSubject.value;
  }

  addGuide(guide: Omit<GuideTouristique, 'id'>): void {
    const actuels = this.guidesSubject.value;
    const prochainId = actuels.length > 0 ? Math.max(...actuels.map(g => g.id)) + 1 : 1;
    const nouveauGuide: GuideTouristique = { ...guide, id: prochainId };
    this.guidesSubject.next([...actuels, nouveauGuide]);
  }

  updateGuide(guideModifie: GuideTouristique): void {
    const misAJour = this.guidesSubject.value.map(g =>
      g.id === guideModifie.id ? guideModifie : g
    );
    this.guidesSubject.next(misAJour);
  }

  deleteGuide(id: number): void {
    const filtres = this.guidesSubject.value.filter(g => g.id !== id);
    this.guidesSubject.next(filtres);
  }
}