import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  faRightLeft,
  faUsers,
  faUserGroup,
  faPen,
  faScroll,
  faHouse,
  faCalendar,
  faHashtag,
  faMessage,
} from '@fortawesome/free-solid-svg-icons';
import { SidebarService } from 'apps/shared-components/sidebar/service/sidebar.service';
import { ICommunityGroup } from '@commudle/shared-models';
import { SeoService } from '@commudle/shared-services';
import { ESidebarWidth, ESidebarHeading } from 'apps/shared-components/sidebar/enum/sidebar.enum';
import { FooterService } from 'apps/commudle-admin/src/app/services/footer.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false,
})
export class DashboardComponent implements OnInit, OnDestroy {
  communityGroup: ICommunityGroup;
  subscriptions: Subscription[] = [];

  sidebarExpanded = true;
  ESidebarWidth = ESidebarWidth;
  ESidebarHeading = ESidebarHeading;
  sidebarEventName = 'communityGroup';

  icons = {
    faRightLeft,
    faUsers,
    faUserGroup,
    faPen,
    faScroll,
    faHouse,
    faCalendar,
    faHashtag,
    faMessage,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private seoService: SeoService,
    private footerService: FooterService,
    public sidebarService: SidebarService,
  ) {}

  ngOnInit() {
    this.footerService.changeMiniFooterStatus(false);
    this.seoService.noIndex(true);

    this.subscriptions.push(
      this.activatedRoute.data.subscribe((data) => {
        this.communityGroup = data.community_group;
        this.setMeta();
      }),
    );

    this.sidebarService.setSidebarVisibility(this.sidebarEventName, true);

    if (Object.prototype.hasOwnProperty.call(this.sidebarService.setSidebar$, this.sidebarEventName)) {
      this.subscriptions.push(
        this.sidebarService.setSidebar$[this.sidebarEventName].subscribe((data) => {
          this.sidebarExpanded = data;
        }),
      );
    }
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
    this.footerService.changeMiniFooterStatus(true);
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  get logoUrl(): string {
    return this.communityGroup?.logo?.url || '';
  }

  get groupSubscriptionId(): number {
    return this.communityGroup?.user_subscription_id || 0;
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebarVisibility(this.sidebarEventName);
  }

  setMeta() {
    this.seoService.setTags(
      `Dashboard - Admin - ${this.communityGroup.name}`,
      this.communityGroup.mini_description,
      this.communityGroup.logo.i350,
    );
  }
}
