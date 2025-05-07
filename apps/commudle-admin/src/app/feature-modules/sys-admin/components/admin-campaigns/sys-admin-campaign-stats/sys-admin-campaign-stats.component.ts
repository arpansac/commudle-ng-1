import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SeoService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-sys-admin-campaign-stats',
  templateUrl: './sys-admin-campaign-stats.component.html',
  styleUrls: ['./sys-admin-campaign-stats.component.scss'],
})
export class SysAdminCampaignStatsComponent implements OnInit {
  campaignId: number;
  constructor(private route: ActivatedRoute, private seoService: SeoService) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.campaignId = params['campaign_id'];
    });
    // FIXME: Complete the SEO service implementation
    this.seoService.setTags('title', 'description', 'https://commudle.com/assets/images/commudle-logo192.png');
  }
}
