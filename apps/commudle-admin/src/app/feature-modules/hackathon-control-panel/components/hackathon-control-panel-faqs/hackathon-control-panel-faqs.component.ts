import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ICommunity, IHackathon, EDbModels } from '@commudle/shared-models';
import { Subscription } from 'rxjs';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { ICommunityGroup } from 'apps/shared-models/community-group.model';
import { SeoService } from '@commudle/shared-services';

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

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
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

  setMeta() {
    this.seoService.setTitle(`FAQs | Dashboard | ${this.hackathon.name} | ${this.parent.name}`);
  }
}
