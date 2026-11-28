import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { GuideTouristique, StatutGuide, REGIONS, STATUTS } from '../../models/guide-touristique';
import { GuideService } from '../../services/guide';

interface ModeleFormulaire {
  nom: string;
  prenom: string;
  specialite: string;
  region: string;
  telephone: string;
  email: string;
  note: number | null;
  statut: StatutGuide;
}

@Component({
  selector: 'app-guide-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guide-form.html',
  styleUrl: './guide-form.css'
})
export class GuideForm implements OnChanges {
  private guideService = inject(GuideService);

  @ViewChild(NgForm) formulaireRef?: NgForm;

  @Input() guideEnEdition: GuideTouristique | null = null;
  // true = fiche enregistrée, false = modification annulée
  @Output() editionTerminee = new EventEmitter<boolean>();

  readonly regionsSenegal = REGIONS;
  readonly statutsDisponibles = STATUTS;

  // Numéro sénégalais : +221 facultatif, puis 77/78/76/75/70 (mobile) ou 33/30 (fixe)
  readonly motifTelephone = '(\\+221|00221)?\\s?(7[05-8]|3[03])\\s?\\d{3}\\s?\\d{2}\\s?\\d{2}';
  readonly motifEmail = '[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}';

  modele: ModeleFormulaire = this.creerModeleVide();
  soumis = false;
  messageFeedback = '';
  typeFeedback: 'succes' | 'erreur' = 'succes';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['guideEnEdition']) {
      this.soumis = false;
      if (this.guideEnEdition) {
        const { id, ...reste } = this.guideEnEdition;
        this.modele = { ...reste };
        this.messageFeedback = '';
      } else {
        this.modele = this.creerModeleVide();
      }
      this.formulaireRef?.resetForm(this.modele);
    }
  }

  onSubmit(form: NgForm): void {
    this.soumis = true;
    this.messageFeedback = '';

    if (form.invalid) {
      this.afficherErreur('Veuillez corriger les champs signalés avant de valider.');
      return;
    }

    const donnees: Omit<GuideTouristique, 'id'> = {
      nom: this.modele.nom.trim(),
      prenom: this.modele.prenom.trim(),
      specialite: this.modele.specialite.trim(),
      region: this.modele.region,
      telephone: this.modele.telephone.trim(),
      email: this.modele.email.trim(),
      note: Number(this.modele.note),
      statut: this.modele.statut
    };

    if (donnees.nom.length < 2 || donnees.prenom.length < 2 || donnees.specialite.length < 3) {
      this.afficherErreur('Les champs texte ne doivent pas contenir uniquement des espaces.');
      return;
    }

    const enEdition = this.guideEnEdition;
    const resultat = enEdition
      ? this.guideService.updateGuide({ id: enEdition.id, ...donnees })
      : this.guideService.addGuide(donnees);

    if (!resultat.succes) {
      this.afficherErreur(resultat.message);
      return;
    }

    this.typeFeedback = 'succes';
    if (enEdition) {
      this.messageFeedback = `La fiche de ${donnees.prenom} ${donnees.nom} a bien été mise à jour.`;
      this.soumis = false;
      this.editionTerminee.emit(true);
    } else {
      this.messageFeedback = `Le guide ${donnees.prenom} ${donnees.nom} a bien été ajouté.`;
      this.reinitialiser(form, false);
    }
  }

  annulerEdition(form: NgForm): void {
    this.reinitialiser(form, true);
    this.editionTerminee.emit(false);
  }

  reinitialiser(form: NgForm, effacerMessage = true): void {
    this.soumis = false;
    this.modele = this.creerModeleVide();
    form.resetForm(this.modele);
    if (effacerMessage) {
      this.messageFeedback = '';
    }
  }

  private afficherErreur(message: string): void {
    this.typeFeedback = 'erreur';
    this.messageFeedback = message;
  }

  private creerModeleVide(): ModeleFormulaire {
    return {
      nom: '',
      prenom: '',
      specialite: '',
      region: '',
      telephone: '',
      email: '',
      note: null,
      statut: 'Disponible'
    };
  }
}