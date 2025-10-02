import { Component, OnDestroy, OnInit } from '@angular/core';
import { RecommendationService } from 'apps/commudle-admin/src/app/feature-modules/recommendations/services/recommendation.service';
import { ICommunityBuild } from 'apps/shared-models/community-build.model';
import { LibAuthwatchService } from 'apps/shared-services/lib-authwatch.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-recommended-builds',
    templateUrl: './recommended-builds.component.html',
    styleUrls: ['./recommended-builds.component.scss'],
    standalone: false
})
export class RecommendedBuildsComponent implements OnInit, OnDestroy {
  recommendedCommunityBuilds: ICommunityBuild[] = [];

  private destroy$ = new Subject<void>();

  constructor(private recommendationService: RecommendationService, private libAuthwatchService: LibAuthwatchService) {}

  ngOnInit(): void {
    this.libAuthwatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        this.getRecommendedCommunityBuilds();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getRecommendedCommunityBuilds(): void {
    this.recommendationService
      .getRecommendedCommunityBuilds()
      .subscribe((recommendedCommunityBuilds: ICommunityBuild[]) => {
        this.recommendedCommunityBuilds = recommendedCommunityBuilds;
      });
  }
}
