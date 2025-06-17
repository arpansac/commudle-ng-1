import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EDbModels } from '@commudle/shared-models';
import { ICommunityGroup } from 'apps/shared-models/community-group.model';
import { SeoService } from '@commudle/shared-services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'commudle-community-group-custom-pages',
  templateUrl: './community-group-custom-pages.component.html',
  styleUrls: ['./community-group-custom-pages.component.scss'],
})
export class CommunityGroupCustomPagesComponent implements OnInit, OnDestroy {
  communityGroup: ICommunityGroup;
  EDbModels = EDbModels;

  subscriptions: Subscription[] = [];

  constructor(private activatedRoute: ActivatedRoute, private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.noIndex(true);
    this.subscriptions.push(
      this.activatedRoute.parent.parent.data.subscribe((data) => {
        this.communityGroup = data.community_group;
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
      `Pages | Dashboard | ${this.communityGroup.name}`,
      this.communityGroup.mini_description,
      this.communityGroup.logo?.i350,
    );
  }
}
