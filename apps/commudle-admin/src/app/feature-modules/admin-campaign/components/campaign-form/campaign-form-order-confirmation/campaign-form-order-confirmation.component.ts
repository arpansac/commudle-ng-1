import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ICampaign } from '@commudle/shared-models';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
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
  };
  moment = moment;
  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.parent.data.subscribe((data) => {
      this.campaign = data['campaign'];
    });
  }
}
