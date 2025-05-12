import { Component, OnDestroy, OnInit } from '@angular/core';
import { ICampaign } from '@commudle/shared-models';
import { SeoService } from '@commudle/shared-services';
import { SysAdminCampaignService } from 'apps/commudle-admin/src/app/feature-modules/sys-admin/services/sys-admin-campaign.service';

@Component({
  selector: 'commudle-admin-campaigns-list',
  templateUrl: './admin-campaigns-list.component.html',
  styleUrls: ['./admin-campaigns-list.component.scss'],
})
export class AdminCampaignsListComponent implements OnInit, OnDestroy {
  campaigns: ICampaign[];
  page = 1;
  count = 10;
  total: number;
  isLoading = true;

  constructor(private campaignService: SysAdminCampaignService, private seoService: SeoService) {}

  ngOnInit() {
    this.fetchCampaigns();
    this.seoService.noIndex(true);

    // FIXME: Complete the SEO service implementation

    this.seoService.setTags('title', 'description', 'https://commudle.com/assets/images/commudle-logo192.png');
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
  }

  fetchCampaigns() {
    this.isLoading = true;
    this.campaignService.index(this.page, this.count).subscribe((res) => {
      this.campaigns = res.values;
      this.page = res.page;
      this.total = res.total;
      this.isLoading = false;
    });
  }
}
