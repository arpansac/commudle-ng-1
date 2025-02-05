import { Component, OnInit } from '@angular/core';
import { ICampaign } from '@commudle/shared-models';
import { SysAdminCampaignService } from 'apps/commudle-admin/src/app/feature-modules/sys-admin/services/sys-admin-campaign.service';

@Component({
  selector: 'commudle-admin-campaigns-list',
  templateUrl: './admin-campaigns-list.component.html',
  styleUrls: ['./admin-campaigns-list.component.scss'],
})
export class AdminCampaignsListComponent implements OnInit {
  campaigns: ICampaign[];
  page = 1;
  count = 10;
  total: number;

  constructor(private campaignService: SysAdminCampaignService) {}

  ngOnInit() {
    this.fetchCampaigns();
  }

  fetchCampaigns() {
    this.campaignService.getSysAdminIndex(this.page, this.count).subscribe((res) => {
      this.campaigns = res.values;
      this.page = res.page;
      this.total = res.total;
    });
  }
}
