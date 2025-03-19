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
  pagination = {
    page: 1,
    count: 10,
    total: 0,
  };
  constructor(private campaignService: CampaignService) {}

  ngOnInit() {
    this.fetchCampaigns();
  }

  fetchCampaigns() {
    this.campaignService.indexCampaigns(this.pagination.page, this.pagination.count).subscribe((res) => {
      this.campaigns = res.values;
      this.pagination.total = res.total;
      this.pagination.page = res.page;
      this.isLoading = false;
    });
  }
}
