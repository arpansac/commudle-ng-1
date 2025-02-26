import { Component, Input, OnInit } from '@angular/core';
import { ICampaign } from '@commudle/shared-models';
import { CampaignService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-campaign-details',
  templateUrl: './campaign-details.component.html',
  styleUrls: ['./campaign-details.component.scss'],
})
export class CampaignDetailsComponent implements OnInit {
  @Input() campaignId: number;
  @Input() campaign: ICampaign;
  isLoading = true;

  constructor(private campaignService: CampaignService) {}

  ngOnInit() {
    if (this.campaignId) {
      this.campaignService.fetchCampaign(this.campaignId).subscribe((campaign) => {
        this.campaign = campaign;
        this.isLoading = false;
      });
    }
  }
}
