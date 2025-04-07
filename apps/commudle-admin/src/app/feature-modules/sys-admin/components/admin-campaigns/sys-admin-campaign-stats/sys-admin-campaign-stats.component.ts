import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'commudle-sys-admin-campaign-stats',
  templateUrl: './sys-admin-campaign-stats.component.html',
  styleUrls: ['./sys-admin-campaign-stats.component.scss'],
})
export class SysAdminCampaignStatsComponent implements OnInit {
  campaignId: number;
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.campaignId = params['campaign_id'];
    });
  }
}
