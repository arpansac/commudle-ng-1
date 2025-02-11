import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ICampaign, ECampaignStatus } from '@commudle/shared-models';
import { CampaignService } from '@commudle/shared-services';
import { faEdit, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
@Component({
  selector: 'commudle-campaign-form-order-confirmation',
  templateUrl: './campaign-form-order-confirmation.component.html',
  styleUrls: ['./campaign-form-order-confirmation.component.scss'],
})
export class CampaignFormOrderConfirmationComponent implements OnInit {
  campaign: ICampaign;
  icons = {
    faEdit,
    faArrowRight,
  };
  moment = moment;
  constructor(private activatedRoute: ActivatedRoute, private campaignService: CampaignService) {}

  ngOnInit() {
    this.activatedRoute.parent.data.subscribe((data) => {
      this.campaign = data['campaign'];
    });
  }

  submitForApproval() {
    this.campaignService
      .updateCampaign({ campaign: { status: ECampaignStatus.SUBMITTED } }, this.campaign.id)
      .subscribe();
  }
}
