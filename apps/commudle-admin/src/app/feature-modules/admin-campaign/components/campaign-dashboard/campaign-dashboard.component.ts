import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ECampaignStatus, ICampaign } from '@commudle/shared-models';
import { CampaignService, SeoService } from '@commudle/shared-services';
import * as moment from 'moment';
import { faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import { map } from 'rxjs/operators';

@Component({
    selector: 'commudle-campaign-dashboard',
    templateUrl: './campaign-dashboard.component.html',
    styleUrls: ['./campaign-dashboard.component.scss'],
    standalone: false
})
export class CampaignDashboardComponent implements OnInit {
  campaigns: ICampaign[];
  isLoading = true;
  selectedStatus: ECampaignStatus | null = null;
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

  constructor(
    private campaignService: CampaignService,
    private seoService: SeoService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.route.queryParams
      .pipe(
        map((params) => {
          const status = params['status'];
          return status ? (status as ECampaignStatus) : null;
        }),
      )
      .subscribe((status) => {
        this.selectedStatus = status;
        this.fetchCampaigns(status ?? undefined);
      });
  }

  onRefreshRequested(status: ECampaignStatus | null) {
    const queryParams = status != null ? { status } : { status: null };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  fetchCampaigns(statusFilter?: ECampaignStatus) {
    this.campaignService.indexCampaigns(this.pagination.page, this.pagination.count, statusFilter).subscribe((res) => {
      this.campaigns = res.values;
      this.pagination.total = res.total;
      this.pagination.page = res.page;
      this.isLoading = false;
      this.seoService.setTags(
        'My Campaigns',
        'A dashboard to track all your campaigns',
        'https://commudle.com/assets/images/commudle-logo192.png',
      );
    });
  }
}
