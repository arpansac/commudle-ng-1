import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SidebarService } from 'apps/shared-components/sidebar/service/sidebar.service';
import {
  faAnglesRight,
  faArrowLeft,
  faRightLeft,
  faCalendar,
  faCircleInfo,
  faFileImage,
  faSackDollar,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FooterService } from 'apps/commudle-admin/src/app/services/footer.service';
import { ESidebarWidth } from 'apps/shared-components/sidebar/enum/sidebar.enum';
import { Subscription } from 'rxjs';

@Component({
  selector: 'commudle-campaign-form',
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.scss'],
})
export class CampaignFormComponent implements OnInit, OnDestroy {
  ESidebarWidth = ESidebarWidth;
  isExpanded = false;
  sidebarEventName: string;
  lastSegment: string;
  slug: string;
  icons = {
    faAnglesRight,
    faRightLeft,
    faArrowLeft,
    faUser,
    faCircleInfo,
    faCalendar,
    faSackDollar,
    faFileImage,
  };
  isEditMode = false;
  private subscriptions: Subscription[] = [];

  constructor(private router: Router, private footerService: FooterService, private sidebarService: SidebarService) {
    this.sidebarEventName = 'campaignFormComponent';
  }

  ngOnInit() {
    const url = this.router.url;

    this.isEditMode = url.includes('/edit/');
    this.generateSlug();
    this.footerService.changeMiniFooterStatus(false);
    this.isExpanded = window.innerWidth > 768;
    this.sidebarService.setSidebarVisibility(this.sidebarEventName, this.isExpanded, true);

    this.subscriptions.push(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.generateSlug();
        }
      }),
    );
  }
  toggleSidebar(): void {
    this.sidebarService.toggleSidebarVisibility(this.sidebarEventName);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.footerService.changeMiniFooterStatus(true);
  }

  generateSlug() {
    this.lastSegment = window.location.pathname.split('/').pop();
    if (this.lastSegment === 'order-setup') {
      this.slug = 'Order Setup';
    } else if (this.lastSegment === 'order-confirmation') {
      this.slug = 'Order Confirmation';
    } else {
      this.slug = 'Select Campaign';
    }
  }
}
