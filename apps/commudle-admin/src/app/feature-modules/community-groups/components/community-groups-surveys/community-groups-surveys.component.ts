import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ICommunityGroup } from 'apps/shared-models/community-group.model';
import { SeoService } from 'apps/shared-services/seo.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'commudle-community-groups-surveys',
  templateUrl: './community-groups-surveys.component.html',
  styleUrls: ['./community-groups-surveys.component.scss'],
})
export class CommunityGroupsSurveysComponent implements OnInit, OnDestroy {
  parentId;

  subscriptions: Subscription[] = [];
  communityGroup: ICommunityGroup;

  constructor(private activatedRoute: ActivatedRoute, private seoService: SeoService) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.activatedRoute.parent.data.subscribe((data) => {
        if (data.community_group) {
          this.communityGroup = data.community_group;
          this.parentId = data.community_group.slug;
        }
        this.setMeta();
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.seoService.noIndex(false);
  }

  setMeta() {
    this.seoService.setTags(
      `Surveys | Dashboard | ${this.communityGroup.name}`,
      this.communityGroup.mini_description,
      this.communityGroup.logo?.i350,
    );
    this.seoService.noIndex(true);
  }
}
