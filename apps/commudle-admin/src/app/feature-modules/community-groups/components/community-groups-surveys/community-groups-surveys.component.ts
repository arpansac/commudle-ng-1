import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ICommunityGroup } from 'apps/shared-models/community-group.model';
import { SeoService } from '@commudle/shared-services';
import { Subscription } from 'rxjs';

@Component({
    selector: 'commudle-community-groups-surveys',
    templateUrl: './community-groups-surveys.component.html',
    styleUrls: ['./community-groups-surveys.component.scss'],
    standalone: false
})
export class CommunityGroupsSurveysComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  communityGroup: ICommunityGroup;

  constructor(private activatedRoute: ActivatedRoute, private seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.noIndex(true);
    this.subscriptions.push(
      this.activatedRoute.parent.data.subscribe((data) => {
        if (data.community_group) {
          this.communityGroup = data.community_group;
        }
        this.setMeta();
      }),
    );
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  setMeta() {
    this.seoService.setTags(
      `Surveys | Dashboard | ${this.communityGroup.name}`,
      this.communityGroup.mini_description,
      this.communityGroup.logo?.i350,
    );
  }
}
