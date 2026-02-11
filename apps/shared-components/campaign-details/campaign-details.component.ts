import { Component, Input, OnInit } from '@angular/core';
import { ICampaign } from '@commudle/shared-models';
import { CampaignService } from '@commudle/shared-services';
import * as moment from 'moment';

@Component({
    selector: 'commudle-campaign-details',
    templateUrl: './campaign-details.component.html',
    styleUrls: ['./campaign-details.component.scss'],
    standalone: false
})
export class CampaignDetailsComponent implements OnInit {
  @Input() campaignId: number;
  @Input() campaign: ICampaign;
  isLoading = true;
  // Expose moment to the template
  moment = moment;

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
