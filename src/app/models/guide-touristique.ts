export type StatutGuide = 'Disponible' | 'En mission' | 'Indisponible';

export interface GuideTouristique {
  id: number;
  nom: string;
  prenom: string;
  specialite: string;
  region: string;
  telephone: string;
  email: string;
  note: number;
  statut: StatutGuide;
}