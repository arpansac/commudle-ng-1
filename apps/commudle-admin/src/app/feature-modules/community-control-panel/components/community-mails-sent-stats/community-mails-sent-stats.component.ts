import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ICommunity } from '@commudle/shared-models';
import { SeoService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-community-mails-sent-stats',
  templateUrl: './community-mails-sent-stats.component.html',
  styleUrls: ['./community-mails-sent-stats.component.scss'],
})
export class CommunityMailsSentStatsComponent implements OnInit, OnDestroy {
  community: ICommunity;

  subscriptions: Subscription[] = [];

  constructor(private activatedRoute: ActivatedRoute, private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.noIndex(true);
    this.subscriptions.push(
      this.activatedRoute.parent.data.subscribe((value) => {
        this.community = value.community;
        this.setMeta();
      }),
    );
  }

  ngOnDestroy() {
    this.seoService.noIndex(false);
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  setMeta() {
    this.seoService.setTitle(`Mails Sent Stats | Dashboard | ${this.community.name}`);
  }
}
