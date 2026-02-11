import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'commudle-admin-campaign-stats',
    templateUrl: './admin-campaign-stats.component.html',
    styleUrls: ['./admin-campaign-stats.component.scss'],
    standalone: false
})
export class AdminCampaignStatsComponent implements OnInit {
  campaignId: number;
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.campaignId = params['campaign_id'];
    });
  }
}
