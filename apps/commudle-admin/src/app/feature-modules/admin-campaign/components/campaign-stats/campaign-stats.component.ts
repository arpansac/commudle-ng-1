import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CampaignService } from '@commudle/shared-services';
import { ICampaignStats } from '@commudle/shared-models';

@Component({
  selector: 'commudle-campaign-stats',
  templateUrl: './campaign-stats.component.html',
  styleUrls: ['./campaign-stats.component.scss'],
})
export class CampaignStatsComponent implements OnInit {
  campaignStats: ICampaignStats;
  constructor(private route: ActivatedRoute, private campaignService: CampaignService) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.getCampaignStats(params['campaign_id']);
    });
  }

  getCampaignStats(campaignId: number) {
    this.campaignService.getStats(campaignId).subscribe((stats) => {
      this.campaignStats = stats;
    });
  }
}
