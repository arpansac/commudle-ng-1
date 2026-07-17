import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommunityGroupsService } from 'apps/commudle-admin/src/app/services/community-groups.service';
import { ICommunityGroup } from 'apps/shared-models/community-group.model';
import { IEvent } from 'apps/shared-models/event.model';
import { SeoService } from 'apps/shared-services/seo.service';
import { Subscription } from 'rxjs';
import { EDbModels, IHackathon } from '@commudle/shared-models';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'commudle-community-group-events',
  templateUrl: './community-group-events.component.html',
  styleUrls: ['./community-group-events.component.scss'],
  standalone: false,
})
export class CommunityGroupEventsComponent implements OnInit, OnDestroy {
  communityGroup: ICommunityGroup;
  EDbModels = EDbModels;
  upcomingHackathons: IHackathon[] = [];
  pastEvents: IEvent[] = [];
  upcomingEvents: IEvent[] = [];
  subscriptions: Subscription[] = [];
  faCalendarDays = faCalendarDays;

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
        this.getUpcomingEvents();
        this.getPastEvents();
        this.getUpcomingHackathons();
        this.setMeta();
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  getUpcomingEvents() {
    this.isLoadingUpcoming = true;
    this.subscriptions.push(
      this.communityGroupsService
        .pEvents(this.communityGroup.slug, this.upcomingPage, this.upcomingCount, 'future')
        .subscribe((data) => {
          this.upcomingEvents = data.values;
          this.upcomingTotal = data.total;
          this.upcomingPage = data.page;
          this.upcomingCount = data.count;
          this.isLoadingUpcoming = false;
        }),
    );
  }

  getPastEvents() {
    this.isLoadingPast = true;
    this.subscriptions.push(
      this.communityGroupsService
        .pEvents(this.communityGroup.slug, this.pastPage, this.pastCount, 'past')
        .subscribe((data) => {
          this.pastEvents = data.values;
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
    this.getUpcomingEvents();
  }

  onPastPageChange(page: number) {
    this.pastPage = page;
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { upcoming_page: this.upcomingPage, past_page: this.pastPage },
      queryParamsHandling: 'merge',
    });
    this.getPastEvents();
  }

  setMeta() {
    this.seoService.setTags(
      `Events | ${this.communityGroup.name}`,
      this.communityGroup.mini_description,
      this.communityGroup.logo.i350,
    );
  }

  getUpcomingHackathons() {
    this.subscriptions.push(
      this.communityGroupsService.pHackathons(this.communityGroup.id, 1, 5, 'future').subscribe((data) => {
        this.upcomingHackathons = data.values;
      }),
    );
  }
}
