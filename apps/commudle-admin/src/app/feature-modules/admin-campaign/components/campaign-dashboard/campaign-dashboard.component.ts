import { Component, OnInit } from '@angular/core';
import { ICampaign } from '@commudle/shared-models';
import { CampaignService } from '@commudle/shared-services';
import moment from 'moment';
import { faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'commudle-campaign-dashboard',
  templateUrl: './campaign-dashboard.component.html',
  styleUrls: ['./campaign-dashboard.component.scss'],
})
export class CampaignDashboardComponent implements OnInit {
  campaigns: ICampaign[];
  isLoading = true;
  moment = moment;
  icons = {
    faPlus,
    faEdit,
  };
  constructor(private campaignService: CampaignService) {}

  ngOnInit() {
    this.campaignService.indexCampaigns().subscribe((res) => {
      this.campaigns = res;
      this.isLoading = false;
    });
  }
}
