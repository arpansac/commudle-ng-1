import { Component, OnDestroy, OnInit } from '@angular/core';
import { RecommendationService } from 'apps/commudle-admin/src/app/feature-modules/recommendations/services/recommendation.service';
import { ICommunity } from 'apps/shared-models/community.model';
import { LibAuthwatchService } from 'apps/shared-services/lib-authwatch.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-recommended-communities',
    templateUrl: './recommended-communities.component.html',
    styleUrls: ['./recommended-communities.component.scss'],
    standalone: false
})
export class RecommendedCommunitiesComponent implements OnInit, OnDestroy {
  recommendedCommunities: ICommunity[] = [];

  private destroy$ = new Subject<void>();

  constructor(private recommendationService: RecommendationService, private libAuthwatchService: LibAuthwatchService) {}

  ngOnInit(): void {
    this.libAuthwatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        this.getRecommendedCommunities();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getRecommendedCommunities(): void {
    this.recommendationService.getRecommendedCommunities().subscribe((communities: ICommunity[]) => {
      this.recommendedCommunities = communities;
    });
  }
}
