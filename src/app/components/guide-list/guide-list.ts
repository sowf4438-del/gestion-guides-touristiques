import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { GuideTouristique } from '../../models/guide-touristique';
import { GuideService } from '../../services/guide';

@Component({
  selector: 'app-guide-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guide-list.html',
  styleUrl: './guide-list.css'
})
export class GuideListComponent implements OnInit {
  guides$!: Observable<GuideTouristique[]>;

  constructor(private guideService: GuideService) {}

  ngOnInit(): void {
    this.guides$ = this.guideService.guides$;
  }

  supprimerGuide(id: number): void {
    this.guideService.deleteGuide(id);
  }
}