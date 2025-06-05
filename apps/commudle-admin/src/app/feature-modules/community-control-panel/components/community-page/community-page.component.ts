import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EDbModels } from '@commudle/shared-models';
import { ICommunity } from 'apps/shared-models/community.model';
import { Subscription } from 'rxjs';
import { SeoService } from 'apps/shared-services/seo.service';

@Component({
  selector: 'commudle-community-page',
  templateUrl: './community-page.component.html',
  styleUrls: ['./community-page.component.scss'],
})
export class CommunityPageComponent implements OnInit {
  parentId: number;
  EDbModels = EDbModels;

  community: ICommunity;
  subscriptions: Subscription[] = [];

  constructor(private activatedRoute: ActivatedRoute, private seoService: SeoService) {}

  ngOnInit() {
    // this.parentId = this.activatedRoute.parent.parent.snapshot.params.community_id;
    this.subscriptions.push(
      this.activatedRoute.parent.parent.data.subscribe((value) => {
        if (value.community) {
          this.community = value.community;
          this.parentId = value.community.id;
          this.setMeta();
        }
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.seoService.noIndex(false);
  }

  setMeta() {
    this.seoService.setTitle(`Page Builder | Dashboard | ${this.community.name}`);
    this.seoService.noIndex(true);
  }
}
