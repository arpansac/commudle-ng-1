import { Component, OnInit } from '@angular/core';
import {
  EDbModels,
  IActivityFeed,
  ICommunity,
  IPageInfo,
  IUpcomingEventHackathon,
  IUser,
  IUserStat,
} from '@commudle/shared-models';
import { AppUsersService } from 'apps/commudle-admin/src/app/services/app-users.service';
import { CommunitiesService } from 'apps/commudle-admin/src/app/services/communities.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { FeedService } from 'apps/shared-services/feed.service';
import { AuthService } from '@commudle/shared-services';

@Component({
    selector: 'commudle-user-dashboard',
    templateUrl: './user-dashboard.component.html',
    styleUrls: ['./user-dashboard.component.scss'],
    standalone: false
})
export class UserDashboardComponent implements OnInit {
  currentUser: IUser;
  userProfileDetails: IUserStat;
  managedCommunities: ICommunity[] = [];
  subscriptions: Subscription[] = [];
  page_info: IPageInfo;
  EDbModels = EDbModels;
  loading = true;
  upcomingEventsHackathons: IUpcomingEventHackathon[] = [];
  activityFeed: IActivityFeed[] = [];
  page = 1;
  count = 5;
  total = 0;
  pageInfo: IPageInfo;
  loadActivity = true;
  limit = 5;
  activityTotal: number;
  loadingActivity = false;

  private destroy$ = new Subject<void>();

  constructor(
    private authWatchService: AuthService,
    private appUsersService: AppUsersService,
    private communitiesService: CommunitiesService,
    private feedService: FeedService,
  ) {}

  ngOnInit(): void {
    this.getUserDetails();
    this.getCommunitiesData();
    this.getUpcomingEventsHackathons();
    this.getActivityFeed();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getUserDetails() {
    this.authWatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.currentUser = data;
      if (this.currentUser) {
        this.appUsersService.getProfileStats().subscribe((data) => {
          this.userProfileDetails = data;
        });
      }
    });
  }

  getCommunitiesData() {
    this.subscriptions.push(
      this.communitiesService.userManagedCommunities$.subscribe((data: ICommunity[]) => {
        this.managedCommunities = data;
      }),
    );
  }

  getUpcomingEventsHackathons() {
    this.loading = true;
    this.feedService.getUpcomingEventsHackathons(this.count, this.page).subscribe((data) => {
      if (data) {
        this.upcomingEventsHackathons = data.values;
        this.page = data.page;
        this.total = data.total;
        this.loading = false;
      }
    });
  }

  getActivityFeed() {
    if (this.loadingActivity) {
      return;
    }
    this.loadingActivity = true;
    this.feedService.getActivityFeed(this.limit, this.pageInfo?.end_cursor).subscribe((data) => {
      if (data) {
        this.activityFeed = this.activityFeed.concat(data.page.reduce((acc, value) => [...acc, value.data], []));
        this.activityTotal = data.total;
        this.pageInfo = data.page_info;
      }
      this.loadingActivity = false;
      this.loadActivity = false;
    });
  }
}
