import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EDbModels } from '@commudle/shared-models';
import { Subscription } from 'rxjs';
import { ICommunity } from '@commudle/shared-models';
import { SeoService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-community-page',
  templateUrl: './community-page.component.html',
  styleUrls: ['./community-page.component.scss'],
})
export class CommunityPageComponent implements OnInit {
  EDbModels = EDbModels;

  community: ICommunity;
  subscriptions: Subscription[] = [];

  constructor(private activatedRoute: ActivatedRoute, private seoService: SeoService) {}

  ngOnInit() {
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
    this.seoService.setTitle(`Page Builder | Dashboard | ${this.community.name}`);
    this.seoService.noIndex(true);
  }
}
