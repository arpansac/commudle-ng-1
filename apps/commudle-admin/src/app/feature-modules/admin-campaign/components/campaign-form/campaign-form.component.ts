import { Component, OnInit } from '@angular/core';
import { ESidebarWidth } from 'apps/shared-components/sidebar/enum/sidebar.enum';
import {
  faAnglesRight,
  faArrowLeft,
  faCalendar,
  faCircleInfo,
  faFileImage,
  faSackDollar,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { Router, NavigationEnd } from '@angular/router';
@Component({
  selector: 'commudle-campaign-form',
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.scss'],
})
export class CampaignFormComponent implements OnInit {
  ESidebarWidth = ESidebarWidth;
  sidebarEventName: string;
  lastSegment: string;
  slug: string;
  icons = {
    faAnglesRight,
    faArrowLeft,
    faUser,
    faCircleInfo,
    faCalendar,
    faSackDollar,
    faFileImage,
  };
  constructor(private router: Router) {
    this.sidebarEventName = 'campaignFormComponent';
  }

  ngOnInit() {
    this.generateSlug();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.generateSlug();
      }
    });
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

  slugToText(slug: string): string {
    return slug.replace(/-/g, ' '); // Replace hyphens with spaces
  }
}
