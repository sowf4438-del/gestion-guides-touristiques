import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GuideTouristique, ResultatOperation } from '../models/guide-touristique';

@Injectable({
  providedIn: 'root'
})
export class GuideService {
  private readonly STORAGE_KEY = 'gestion_guides_touristiques_sn_v2';

  private readonly guidesInitiaux: GuideTouristique[] = [
    { id: 1, nom: 'DIOP', prenom: 'Awa', specialite: 'Écotourisme et mangroves',
      region: 'Ziguinchor', telephone: '+221 77 000 00 01',
      email: 'awa.diop@example.org', note: 4.8, statut: 'Disponible' },
    { id: 2, nom: 'BA', prenom: 'Mamadou', specialite: 'Histoire et patrimoine',
      region: 'Saint-Louis', telephone: '+221 77 000 00 02',
      email: 'mamadou.ba@example.org', note: 4.5, statut: 'En mission' },
    { id: 3, nom: 'FALL', prenom: 'Ndeye', specialite: 'Culture urbaine et musées',
      region: 'Dakar', telephone: '+221 77 000 00 03',
      email: 'ndeye.fall@example.org', note: 4.2, statut: 'Disponible' },
    { id: 4, nom: 'SARR', prenom: 'Ibrahima', specialite: 'Littoral et réserve naturelle',
      region: 'Thiès', telephone: '+221 77 000 00 04',
      email: 'ibrahima.sarr@example.org', note: 3.9, statut: 'Indisponible' },
    { id: 5, nom: 'GOMIS', prenom: 'Marie', specialite: 'Culture diola et artisanat',
      region: 'Ziguinchor', telephone: '+221 77 000 00 05',
      email: 'marie.gomis@example.org', note: 4.6, statut: 'Disponible' },
    { id: 6, nom: 'THIAM', prenom: 'Moussa', specialite: 'Randonnée et faune',
      region: 'Kédougou', telephone: '+221 77 000 00 06',
      email: 'moussa.thiam@example.org', note: 4.0, statut: 'En mission' },
    { id: 7, nom: 'NDIAYE', prenom: 'Aminata', specialite: 'Histoire et patrimoine',
      region: 'Dakar', telephone: '+221 77 000 00 07',
      email: 'aminata.ndiaye@example.org', note: 4.9, statut: 'Disponible' },
    { id: 8, nom: 'CISSE', prenom: 'Pape', specialite: 'Oiseaux et delta du Saloum',
      region: 'Fatick', telephone: '+221 77 000 00 08',
      email: 'pape.cisse@example.org', note: 3.5, statut: 'Indisponible' }
  ];

  private guidesSubject = new BehaviorSubject<GuideTouristique[]>(this.chargerGuides());
  guides$: Observable<GuideTouristique[]> = this.guidesSubject.asObservable();

  private chargerGuides(): GuideTouristique[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return structuredClone(this.guidesInitiaux);
    }
    try {
      const sauvegarde = localStorage.getItem(this.STORAGE_KEY);
      if (!sauvegarde) {
        const demo = structuredClone(this.guidesInitiaux);
        this.sauvegarderGuides(demo);
        return demo;
      }
      const parsed = JSON.parse(sauvegarde);
      return Array.isArray(parsed) ? parsed : structuredClone(this.guidesInitiaux);
    } catch {
      return structuredClone(this.guidesInitiaux);
    }
  }

  private sauvegarderGuides(guides: GuideTouristique[]): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(guides));
    } catch {
      // Stockage local bloqué ou plein : on ignore
    }
  }

  private mettreAJourEtat(nouveauxGuides: GuideTouristique[]): void {
    this.sauvegarderGuides(nouveauxGuides);
    this.guidesSubject.next(nouveauxGuides);
  }

  getGuides(): GuideTouristique[] {
    return this.guidesSubject.value;
  }

  getGuideById(id: number): GuideTouristique | undefined {
    return this.guidesSubject.value.find(g => g.id === id);
  }

  addGuide(guide: Omit<GuideTouristique, 'id'>): ResultatOperation {
    const actuels = this.guidesSubject.value;
    const doublon = actuels.some(g => g.email.toLowerCase() === guide.email.toLowerCase());
    if (doublon) {
      return { succes: false, message: 'Un guide avec cet e-mail existe déjà.' };
    }
    const id = actuels.length > 0 ? Math.max(...actuels.map(g => g.id)) + 1 : 1;
    this.mettreAJourEtat([...actuels, { ...guide, id }]);
    return { succes: true, message: 'Guide ajouté avec succès.' };
  }

  updateGuide(guideModifie: GuideTouristique): ResultatOperation {
    if (!this.getGuideById(guideModifie.id)) {
      return { succes: false, message: 'Guide introuvable.' };
    }
    const autreAvecMemeEmail = this.guidesSubject.value.some(
      g => g.id !== guideModifie.id && g.email.toLowerCase() === guideModifie.email.toLowerCase()
    );
    if (autreAvecMemeEmail) {
      return { succes: false, message: 'Un autre guide utilise déjà cet e-mail.' };
    }
    this.mettreAJourEtat(
      this.guidesSubject.value.map(g => (g.id === guideModifie.id ? guideModifie : g))
    );
    return { succes: true, message: 'Fiche modifiée avec succès.' };
  }

  deleteGuide(id: number): ResultatOperation {
    if (!this.getGuideById(id)) {
      return { succes: false, message: 'Guide introuvable.' };
    }
    this.mettreAJourEtat(this.guidesSubject.value.filter(g => g.id !== id));
    return { succes: true, message: 'Guide supprimé.' };
  }

  reinitialiserDonneesDemo(): ResultatOperation {
    this.mettreAJourEtat(structuredClone(this.guidesInitiaux));
    return { succes: true, message: 'Données de démonstration rétablies.' };
  }
}