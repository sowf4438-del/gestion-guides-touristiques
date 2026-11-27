export type StatutGuide = 'Disponible' | 'En mission' | 'Indisponible';

export const STATUTS: StatutGuide[] = ['Disponible', 'En mission', 'Indisponible'];

export const REGIONS: string[] = [
  'Dakar', 'Diourbel', 'Fatick', 'Kaffrine', 'Kaolack', 'Kédougou', 'Kolda',
  'Louga', 'Matam', 'Saint-Louis', 'Sédhiou', 'Tambacounda', 'Thiès', 'Ziguinchor'
];

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

export interface ResultatOperation {
  succes: boolean;
  message: string;
}