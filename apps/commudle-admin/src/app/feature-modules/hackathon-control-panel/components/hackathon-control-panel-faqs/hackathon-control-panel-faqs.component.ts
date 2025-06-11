import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EDbModels } from '@commudle/shared-models';
import { Subscription } from 'rxjs';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { ICommunity } from 'apps/shared-models/community.model';
import { ICommunityGroup } from 'apps/shared-models/community-group.model';
import { SeoService } from 'apps/shared-services/seo.service';
import { IHackathon } from '@commudle/shared-models';

@Component({
  selector: 'commudle-hackathon-control-panel-faqs',
  templateUrl: './hackathon-control-panel-faqs.component.html',
  styleUrls: ['./hackathon-control-panel-faqs.component.scss'],
})
export class HackathonControlPanelFaqsComponent implements OnInit, OnDestroy {
  hackathonSlug = '';
  parentType = EDbModels.HACKATHON;

  parent: ICommunity | ICommunityGroup;
  subscriptions: Subscription[] = [];
  hackathon: IHackathon;

  constructor(
    private activatedRoute: ActivatedRoute,
    private seoService: SeoService,
    private hackathonService: HackathonService,
  ) {}

  ngOnInit() {
    this.seoService.noIndex(true);

    this.subscriptions.push(
      this.activatedRoute.parent.paramMap.subscribe((params) => {
        this.hackathonSlug = params.get('hackathon_id');
        this.fetchHackathonDetails(params.get('hackathon_id'));
      }),
    );
  }
  fetchHackathonDetails(hackathonId) {
    this.subscriptions.push(
      this.hackathonService.showHackathon(hackathonId).subscribe((data) => {
        // TODO: Add Community Group in Future
        if (data.community) {
          this.parent = data.community;
        }
        this.hackathon = data;
        this.setMeta();
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
    this.seoService.noIndex(false);
  }

  setMeta() {
    this.seoService.setTitle(`FAQs | Dashboard | ${this.hackathon.name} | ${this.parent.name}`);
  }
}
