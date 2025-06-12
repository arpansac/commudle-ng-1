import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ICommunity } from '@commudle/shared-models';
import { SeoService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-admin-community-hackathon',
  templateUrl: './admin-community-hackathon.component.html',
  styleUrls: ['./admin-community-hackathon.component.scss'],
})
export class AdminCommunityHackathonComponent implements OnInit, OnDestroy {
  community: ICommunity;
  subscriptions: Subscription[] = [];

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
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.seoService.noIndex(false);
  }

  setMeta() {
    this.seoService.setTitle(`Hackathons | Dashboard | ${this.community.name}`);
  }
}
