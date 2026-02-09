import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ECampaignStatus, ICampaign } from '@commudle/shared-models';
import { SeoService } from '@commudle/shared-services';
import { SysAdminCampaignService } from 'apps/commudle-admin/src/app/feature-modules/sys-admin/services/sys-admin-campaign.service';

@Component({
    selector: 'commudle-admin-campaigns-list',
    templateUrl: './admin-campaigns-list.component.html',
    styleUrls: ['./admin-campaigns-list.component.scss'],
    standalone: false
})
export class AdminCampaignsListComponent implements OnInit, OnDestroy {
  campaigns: ICampaign[];
  page = 1;
  count = 10;
  total: number;
  isLoading = true;
  currentStatusFilter: ECampaignStatus | null = null;

  constructor(
    private campaignService: SysAdminCampaignService,
    private seoService: SeoService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const status = params['status'];
      const statusFilter =
        status && Object.values(ECampaignStatus).includes(status) ? (status as ECampaignStatus) : null;
      this.currentStatusFilter = statusFilter;
      this.fetchCampaigns(statusFilter ?? undefined);
    });
    this.seoService.noIndex(true);

    this.seoService.setTags(
      'Admin | Campaigns Dashboard',
      'List of all campaigns created on Commudle',
      'https://commudle.com/assets/images/commudle-logo192.png',
    );
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
  }

  fetchCampaigns(status?: ECampaignStatus | null) {
    this.currentStatusFilter = status ?? null;
    this.isLoading = true;
    this.campaignService.index(this.page, this.count, status).subscribe((res) => {
      this.campaigns = res.values;
      this.page = res.page;
      this.total = res.total;
      this.isLoading = false;
      const queryParams = status != null ? { status } : { status: null };
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: queryParams,
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }

  onRefreshRequested(status: ECampaignStatus | null) {
    this.fetchCampaigns(status);
  }
}
