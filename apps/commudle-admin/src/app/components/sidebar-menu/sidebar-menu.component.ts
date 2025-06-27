import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { NbSidebarService } from '@commudle/theme';
import {
  faFlask,
  faHouse,
  faLightbulb,
  faNewspaper,
  faRectangleAd,
  faSuitcase,
} from '@fortawesome/free-solid-svg-icons';
import { CommunitiesService } from 'apps/commudle-admin/src/app/services/communities.service';
import { CommunityGroupsService } from 'apps/commudle-admin/src/app/services/community-groups.service';
import { ICommunityGroup } from 'apps/shared-models/community-group.model';
import { ICommunityGroups } from 'apps/shared-models/community-groups.model';
import { ICommunity } from 'apps/shared-models/community.model';
import { ICurrentUser } from 'apps/shared-models/current_user.model';
import { EUserRoles } from 'apps/shared-models/enums/user_roles.enum';
import { LibAuthwatchService } from 'apps/shared-services/lib-authwatch.service';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { NotificationsStore } from '../../feature-modules/notifications/store/notifications.store';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss'],
})
export class SidebarMenuComponent implements OnInit, OnDestroy {
  faSuitcase = faSuitcase;
  faHouse = faHouse;
  faFlask = faFlask;
  faNewspaper = faNewspaper;
  faLightbulb = faLightbulb;
  faRectangleAd = faRectangleAd;
  currentUser: ICurrentUser;
  managedCommunities: ICommunity[] = [];
  managedCommunityGroups: ICommunityGroup[] = [];
  communityOrganizerRoles = [EUserRoles.ORGANIZER, EUserRoles.EVENT_ORGANIZER].map(String);
  isSystemAdmin = false;
  EUserRoles = EUserRoles;
  isPageAdsAdmin = false;
  isBadgesAdmin = false;
  isFeaturedCommunitiesAdmin = false;
  isAssetsAdmin = false;
  isFeaturedItemsAdmin = false;
  isAdCampaignAdmin = false;
  isNewsletterAdmin = false;

  // Store notification counts to avoid repeated subscriptions
  communityNotificationCounts: { [key: string]: number } = {};

  private destroy$ = new Subject<void>();

  constructor(
    private authWatchService: LibAuthwatchService,
    private communitiesService: CommunitiesService,
    private communityGroupsService: CommunityGroupsService,
    private sidebarService: NbSidebarService,
    private router: Router,
    private notificationsStore: NotificationsStore,
  ) {}

  ngOnInit(): void {
    this.getCurrentUser();
    this.closeSidebar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCurrentUser(): void {
    this.authWatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((currentUser: ICurrentUser) => {
      this.currentUser = currentUser;

      if (currentUser) {
        // check if current user is having a specific role and add corresponding items
        const matchingOrganizerRoles = currentUser.user_roles.filter((value: string) => {
          return -1 !== this.communityOrganizerRoles.indexOf(value);
        });

        if (matchingOrganizerRoles.length > 0) {
          this.getManagingCommunities(matchingOrganizerRoles);
        }

        if (currentUser.user_roles.includes(EUserRoles.SYSTEM_ADMINISTRATOR)) {
          this.isSystemAdmin = true;
        }

        if (currentUser.user_roles.includes(EUserRoles.PAGE_ADS)) {
          this.isPageAdsAdmin = true;
        }

        if (currentUser.user_roles.includes(EUserRoles.BADGES)) {
          this.isBadgesAdmin = true;
        }

        if (currentUser.user_roles.includes(EUserRoles.FEATURED_COMMUNITIES)) {
          this.isFeaturedCommunitiesAdmin = true;
        }

        if (currentUser.user_roles.includes(EUserRoles.FEATURED_ITEMS)) {
          this.isFeaturedItemsAdmin = true;
        }

        if (currentUser.user_roles.includes(EUserRoles.STATIC_ASSETS)) {
          this.isAssetsAdmin = true;
        }

        if (currentUser.user_roles.includes(EUserRoles.COMMUNITY_ADMIN)) {
          this.getManagingCommunityGroups();
        }
        if (currentUser.user_roles.includes(EUserRoles.AD_CAMPAIGN_ADMIN)) {
          this.isAdCampaignAdmin = true;
        }
        if (currentUser.user_roles.includes(EUserRoles.NEWSLETTER)) {
          this.isNewsletterAdmin = true;
        }
      }
    });
  }

  getManagingCommunities(userRoles: string[]): void {
    this.managedCommunities = [];

    // Create observables for all roles and combine them using forkJoin
    const roleObservables = userRoles.map((role) => this.communitiesService.getRoleCommunities(role));

    // Use forkJoin to wait for all role requests to complete, then get communities data once
    forkJoin(roleObservables)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getCommunitiesData();
      });
  }
  getCommunitiesData() {
    this.communitiesService.userManagedCommunities$.pipe(takeUntil(this.destroy$)).subscribe((data: ICommunity[]) => {
      this.managedCommunities = data;
      // Initialize notifications for all communities at once
      if (data && data.length > 0) {
        data.forEach((community) => {
          this.updateUnreadNotificationsCount(community.id);
          this.notificationsStore.updateNotifications(community.id);
        });
      }
    });
  }

  getManagingCommunityGroups(): void {
    this.communityGroupsService
      .getManagingCommunityGroups()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: ICommunityGroups) => {
        this.managedCommunityGroups = data.community_groups;
      });
  }

  closeSidebar(): void {
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.sidebarService.collapse('mainMenu');
      }
    });
  }

  updateUnreadNotificationsCount(communityId) {
    this.notificationsStore.getCommunityUnreadNotificationsCount(communityId);

    // Subscribe to notification count changes only once per community
    if (!(communityId in this.communityNotificationCounts)) {
      this.communityNotificationCounts[communityId] = 0;

      // Check if the observable exists before subscribing
      if (
        this.notificationsStore.communityNotificationsCount$ &&
        this.notificationsStore.communityNotificationsCount$[communityId]
      ) {
        this.notificationsStore.communityNotificationsCount$[communityId]
          .pipe(takeUntil(this.destroy$))
          .subscribe((count: number) => {
            this.communityNotificationCounts[communityId] = count || 0;
          });
      }
    }
  }

  getUnreadNotificationsCount(communityId): number {
    return this.communityNotificationCounts[communityId] || 0;
  }
}
