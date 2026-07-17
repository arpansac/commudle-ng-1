import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EDbModels, IHackathon } from '@commudle/shared-models';
import { SeoService } from '@commudle/shared-services';
import { CommunityGroupsService } from 'apps/commudle-admin/src/app/services/community-groups.service';
import { ICommunityGroup } from 'apps/shared-models/community-group.model';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

@Component({
  selector: 'commudle-community-group-hackathons',
  templateUrl: './community-group-hackathons.component.html',
  styleUrls: ['./community-group-hackathons.component.scss'],
  standalone: false,
})
export class CommunityGroupHackathonsComponent implements OnInit, OnDestroy {
  communityGroup: ICommunityGroup;
  upcomingHackathons: IHackathon[] = [];
  pastHackathons: IHackathon[] = [];
  subscriptions: Subscription[] = [];
  faCalendarDays = faCalendarDays;
  EDbModels = EDbModels;

  // Upcoming pagination
  upcomingPage = 1;
  upcomingCount = 6;
  upcomingTotal = 0;
  isLoadingUpcoming = false;

  // Past pagination
  pastPage = 1;
  pastCount = 9;
  pastTotal = 0;
  isLoadingPast = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private communityGroupsService: CommunityGroupsService,
    private seoService: SeoService,
  ) {}

  ngOnInit(): void {
    const params = this.activatedRoute.snapshot.queryParams;
    if (params.upcoming_page) {
      this.upcomingPage = Number(params.upcoming_page);
    }
    if (params.past_page) {
      this.pastPage = Number(params.past_page);
    }

    this.subscriptions.push(
      this.activatedRoute.parent.data.subscribe((data) => {
        this.communityGroup = data.community_group;
        this.getUpcomingHackathons();
        this.getPastHackathons();
        this.setMeta();
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  getUpcomingHackathons() {
    this.isLoadingUpcoming = true;
    this.subscriptions.push(
      this.communityGroupsService
        .pHackathons(this.communityGroup.slug, this.upcomingPage, this.upcomingCount, 'future')
        .subscribe((data) => {
          this.upcomingHackathons = data.values;
          this.upcomingTotal = data.total;
          this.upcomingPage = data.page;
          this.upcomingCount = data.count;
          this.isLoadingUpcoming = false;
        }),
    );
  }

  getPastHackathons() {
    this.isLoadingPast = true;
    this.subscriptions.push(
      this.communityGroupsService
        .pHackathons(this.communityGroup.slug, this.pastPage, this.pastCount, 'past')
        .subscribe((data) => {
          this.pastHackathons = data.values;
          this.pastTotal = data.total;
          this.pastPage = data.page;
          this.pastCount = data.count;
          this.isLoadingPast = false;
        }),
    );
  }

  onUpcomingPageChange(page: number) {
    this.upcomingPage = page;
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { upcoming_page: this.upcomingPage, past_page: this.pastPage },
      queryParamsHandling: 'merge',
    });
    this.getUpcomingHackathons();
  }

  onPastPageChange(page: number) {
    this.pastPage = page;
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { upcoming_page: this.upcomingPage, past_page: this.pastPage },
      queryParamsHandling: 'merge',
    });
    this.getPastHackathons();
  }

  setMeta() {
    this.seoService.setTags(
      `Hackathons | ${this.communityGroup.name}`,
      this.communityGroup.mini_description,
      this.communityGroup.logo.i350,
    );
  }
}
