import { Component } from '@angular/core';
import { GuideListComponent } from './components/guide-list/guide-list';
import { GuideForm } from './components/guide-form/guide-form';
import { GuideTouristique } from './models/guide-touristique';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GuideListComponent, GuideForm],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  guideSelectionne: GuideTouristique | null = null;

  onEditionTerminee(): void {
    this.guideSelectionne = null;
  }
}