import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ICommunity } from 'apps/shared-models/community.model';
import { Subscription } from 'rxjs';
import { SeoService } from 'apps/shared-services/seo.service';

@Component({
  selector: 'commudle-community-surveys',
  templateUrl: './community-surveys.component.html',
  styleUrls: ['./community-surveys.component.scss'],
})
export class CommunitySurveysComponent implements OnInit, OnDestroy {
  parentId: number;
  community: ICommunity;
  subscriptions: Subscription[] = [];

  constructor(private activatedRoute: ActivatedRoute, private seoService: SeoService) {}

  ngOnInit(): void {
    // this.parentId = this.activatedRoute.parent.snapshot.params.community_id;
    // this.seoService.setTitle(`Surveys | Dashboard | ${this.parentId}`);
    // this.seoService.noIndex(true);

    this.subscriptions.push(
      this.activatedRoute.parent.data.subscribe((value) => {
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
    this.seoService.setTitle(`Surveys | Dashboard | ${this.community.name}`);
    this.seoService.noIndex(true);
  }
}
