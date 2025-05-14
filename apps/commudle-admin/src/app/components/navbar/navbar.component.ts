import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faBars, faMagnifyingGlass, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { NbMenuItem, NbSidebarService, NbSidebarState } from '@commudle/theme';
import { AppCentralNotificationService } from 'apps/commudle-admin/src/app/services/app-central-notifications.service';
import { ICurrentUser } from 'apps/shared-models/current_user.model';
import { TruncateTextPipe } from 'apps/shared-pipes/truncate-text.pipe';
import { LibAuthwatchService } from 'apps/shared-services/lib-authwatch.service';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';
import { DarkModeService } from 'apps/commudle-admin/src/app/services/dark-mode.service';
import { Subject, takeUntil } from 'rxjs';
import { SidebarService } from 'apps/shared-components/sidebar/service/sidebar.service';
import { EUserRoles } from 'apps/shared-models/enums/user_roles.enum';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: ICurrentUser;
  userContextMenu: NbMenuItem[] = [{ title: 'Logout', link: '/logout' }];
  sideBarNotifications = false;
  sideBarState: NbSidebarState;

  faBars = faBars;
  staticAssets = staticAssets;

  isDarkMode = false;
  faSun = faSun;
  faMoon = faMoon;
  faMagnifyingGlass = faMagnifyingGlass;
  sidebarEventName = 'MainSidebar';
  showAdminSidebar = false;
  EUserRoles = EUserRoles;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authwatchService: LibAuthwatchService,
    private appCentralNotificationService: AppCentralNotificationService,
    private darkModeService: DarkModeService,
    public sidebarService: SidebarService,
  ) {}

  ngOnInit(): void {
    this.getUser();
    this.checkNotifications();
    this.darkModeService.isDarkMode$.subscribe((isDarkMode) => {
      this.isDarkMode = isDarkMode;
    });
  }

  getUser() {
    this.authwatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((currentUser) => {
      this.currentUser = currentUser;

      if (this.currentUser) {
        const adminRoles = [
          EUserRoles.SYSTEM_ADMINISTRATOR,
          EUserRoles.PAGE_ADS,
          EUserRoles.BADGES,
          EUserRoles.FEATURED_COMMUNITIES,
          EUserRoles.FEATURED_ITEMS,
          EUserRoles.STATIC_ASSETS,
          EUserRoles.COMMUNITY_ADMIN,
          EUserRoles.AD_CAMPAIGN_ADMIN,
          EUserRoles.NEWSLETTER,
          EUserRoles.ORGANIZER,
          EUserRoles.EVENT_ORGANIZER,
          EUserRoles.EVENT_VOLUNTEER,
        ];

        if (adminRoles.some((role) => currentUser.user_roles.includes(role))) {
          this.showAdminSidebar = true;
        }

        this.setContextMenu();
      }
    });
  }

  setContextMenu() {
    const truncatePipe = new TruncateTextPipe();
    if (this.userContextMenu.length <= 1) {
      this.userContextMenu.unshift({
        title: `@${truncatePipe.transform(this.currentUser.username, 10)}`,
        link: `/users/${this.currentUser.username}`,
        badge: {
          text: 'Profile',
          status: 'basic',
        },
      });
    } else {
      this.userContextMenu[0] = {
        title: `@${truncatePipe.transform(this.currentUser.username, 10)}`,
        link: `/users/${this.currentUser.username}`,
        badge: {
          text: 'Profile',
          status: 'basic',
        },
      };
    }
  }

  checkNotifications(): void {
    this.appCentralNotificationService.sidebarNotifications$.subscribe((data) => (this.sideBarNotifications = data));
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebarVisibility(this.sidebarEventName);
  }

  login() {
    this.router.navigate(['/login'], { queryParams: { redirect: this.router.url } });
  }

  toggleDarkMode(isDarkMode: boolean): void {
    this.darkModeService.toggleDarkMode(isDarkMode);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
