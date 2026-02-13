import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SeoService } from '@commudle/shared-services';

@Component({
    selector: 'commudle-sys-admin-campaign-stats',
    templateUrl: './sys-admin-campaign-stats.component.html',
    styleUrls: ['./sys-admin-campaign-stats.component.scss'],
    standalone: false
})
export class SysAdminCampaignStatsComponent implements OnInit, OnDestroy {
  campaignId: string;
  constructor(private route: ActivatedRoute, private seoService: SeoService) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.campaignId = params['campaign_id'];
    });
    this.seoService.noIndex(true);
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
  }
}
