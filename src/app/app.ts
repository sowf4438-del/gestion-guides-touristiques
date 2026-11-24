import { Component } from '@angular/core';
import { GuideListComponent } from './components/guide-list/guide-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GuideListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}