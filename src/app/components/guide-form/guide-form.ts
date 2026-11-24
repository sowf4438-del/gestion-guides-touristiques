import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { GuideTouristique, StatutGuide } from '../../models/guide-touristique';
import { GuideService } from '../../services/guide';

@Component({
  selector: 'app-guide-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guide-form.html',
  styleUrl: './guide-form.css'
})
export class GuideForm implements OnChanges {
  private guideService = inject(GuideService);

  @Input() guideEnEdition: GuideTouristique | null = null;
  @Output() editionTerminee = new EventEmitter<void>();

  readonly regionsSenegal: string[] = [
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

  readonly statutsDisponibles: StatutGuide[] = [
    'Disponible',
    'En mission',
    'Indisponible'
  ];

  modele: Omit<GuideTouristique, 'id'> = this.creerModeleVide();
  soumis = false;
  messageFeedback = '';
  typeFeedback: 'succes' | 'erreur' = 'succes';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['guideEnEdition']) {
      if (this.guideEnEdition) {
        const { id, ...reste } = this.guideEnEdition;
        this.modele = { ...reste };
        this.soumis = false;
        this.messageFeedback = '';
      } else {
        this.modele = this.creerModeleVide();
      }
    }
  }

  onSubmit(form: NgForm): void {
    this.soumis = true;
    this.messageFeedback = '';

    if (form.invalid) {
      this.typeFeedback = 'erreur';
      this.messageFeedback = 'Veuillez corriger les champs signalés avant de valider.';
      return;
    }

    const donneesPropres: Omit<GuideTouristique, 'id'> = {
      nom: this.modele.nom.trim(),
      prenom: this.modele.prenom.trim(),
      specialite: this.modele.specialite.trim(),
      region: this.modele.region,
      telephone: this.modele.telephone.trim(),
      email: this.modele.email.trim(),
      note: Number(this.modele.note),
      statut: this.modele.statut
    };

    if (this.guideEnEdition) {
      this.guideService.updateGuide({
        id: this.guideEnEdition.id,
        ...donneesPropres
      });
      this.typeFeedback = 'succes';
      this.messageFeedback = `Le guide ${donneesPropres.prenom} ${donneesPropres.nom} a bien été mis à jour.`;
      this.soumis = false;
      this.editionTerminee.emit();
    } else {
      this.guideService.addGuide(donneesPropres);
      this.typeFeedback = 'succes';
      this.messageFeedback = `Le guide ${donneesPropres.prenom} ${donneesPropres.nom} a bien été ajouté.`;
      this.reinitialiser(form, false);
    }
  }

  annulerEdition(form: NgForm): void {
    this.reinitialiser(form, true);
    this.editionTerminee.emit();
  }

  reinitialiser(form: NgForm, effacerMessage = true): void {
    this.soumis = false;
    this.modele = this.creerModeleVide();
    form.resetForm(this.modele);
    if (effacerMessage) {
      this.messageFeedback = '';
    }
  }

  private creerModeleVide(): Omit<GuideTouristique, 'id'> {
    return {
      nom: '',
      prenom: '',
      specialite: '',
      region: '',
      telephone: '',
      email: '',
      note: 4.5,
      statut: 'Disponible'
    };
  }
}