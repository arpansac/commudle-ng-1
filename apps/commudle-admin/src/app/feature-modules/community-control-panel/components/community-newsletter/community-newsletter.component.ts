import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ICommunity } from '@commudle/shared-models';
import { SeoService } from '@commudle/shared-services';

@Component({
    selector: 'commudle-community-newsletter',
    templateUrl: './community-newsletter.component.html',
    styleUrls: ['./community-newsletter.component.scss'],
    standalone: false
})
export class CommunityNewsletterComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  community: ICommunity;
  constructor(private activatedRoute: ActivatedRoute, private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.noIndex(true);
    this.subscriptions.push(
      this.activatedRoute.parent.parent.data.subscribe((value) => {
        if (value.community) {
          this.community = value.community;
          this.setMeta();
        }
      }),
    );
  }

  ngOnDestroy() {
    this.seoService.noIndex(false);
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  setMeta() {
    this.seoService.setTitle(`Newsletters | Dashboard | ${this.community.name}`);
  }
}
