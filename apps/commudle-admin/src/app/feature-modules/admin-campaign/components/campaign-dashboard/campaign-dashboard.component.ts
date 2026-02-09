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
  page = 1;
  count = 10;
  total = 0;

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
    this.seoService.setTags(
      'My Campaigns',
      'A dashboard to track all your campaigns',
      'https://commudle.com/assets/images/commudle-logo192.png',
    );
  }

  onRefreshRequested(status: ECampaignStatus | null) {
    this.fetchCampaigns(status);
  }

  fetchCampaigns(statusFilter?: ECampaignStatus) {
    this.isLoading = true;
    this.campaignService.indexCampaigns(this.page, this.count, statusFilter).subscribe((res) => {
      this.campaigns = res.values;
      this.page = res.page;
      this.total = res.total;
      this.isLoading = false;
      const queryParams = statusFilter != null ? { status: statusFilter } : { status: null };
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: queryParams,
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }
}
