import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ICommunity } from '@commudle/shared-models';
import { SeoService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-community-newsletter',
  templateUrl: './community-newsletter.component.html',
  styleUrls: ['./community-newsletter.component.scss'],
})
export class CommunityNewsletterComponent implements OnInit, OnDestroy {
  parentId: string;
  subscriptions: Subscription[] = [];
  community: ICommunity;
  constructor(private activatedRoute: ActivatedRoute, private seoService: SeoService) {}

  ngOnInit() {
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
    this.seoService.setTitle(`Newsletters | Dashboard | ${this.community.name}`);
    this.seoService.noIndex(true);
  }
}
