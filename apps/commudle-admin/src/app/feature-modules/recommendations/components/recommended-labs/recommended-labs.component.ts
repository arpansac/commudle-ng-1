import { Component, OnDestroy, OnInit } from '@angular/core';
import { RecommendationService } from 'apps/commudle-admin/src/app/feature-modules/recommendations/services/recommendation.service';
import { ILab } from 'apps/shared-models/lab.model';
import { LibAuthwatchService } from 'apps/shared-services/lib-authwatch.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-recommended-labs',
  templateUrl: './recommended-labs.component.html',
  styleUrls: ['./recommended-labs.component.scss'],
})
export class RecommendedLabsComponent implements OnInit, OnDestroy {
  recommendedLabs: ILab[] = [];

  private destroy$ = new Subject<void>();

  constructor(private recommendationService: RecommendationService, private libAuthwatchService: LibAuthwatchService) {}

  ngOnInit(): void {
    this.libAuthwatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        this.getRecommendedLabs();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getRecommendedLabs() {
    this.recommendationService.getRecommendedLabs().subscribe((labs: ILab[]) => {
      this.recommendedLabs = labs;
    });
  }
}
