/* eslint-disable @nx/enforce-module-boundaries */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ICommunity } from '@commudle/shared-models';
import { CommunitiesService } from 'apps/commudle-admin/src/app/services/communities.service';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { EHackathonStatus, IHackathon } from 'apps/shared-models/hackathon.model';
import { Subscription } from 'rxjs';
import {
  faArrowLeft,
  faPenToSquare,
  faCircleInfo,
  faLink,
  faCalendarDays,
  faAward,
  faSackDollar,
  faMicrophone,
  faStar,
  faCircleQuestion,
  faEye,
  faChartPie,
  faHashtag,
  faEnvelope,
  faGamepad,
  faRectangleList,
  faArrowUpRightFromSquare,
  faBars,
} from '@fortawesome/free-solid-svg-icons';
import { FooterService } from 'apps/commudle-admin/src/app/services/footer.service';
import { SeoService } from '@commudle/shared-services';
import { ESidebarWidth } from 'apps/shared-components/sidebar/enum/sidebar.enum';
import { SidebarService } from 'apps/shared-components/sidebar/service/sidebar.service';

@Component({
  selector: 'commudle-hackathon-control-panel-dashboard',
  templateUrl: './hackathon-control-panel-dashboard.component.html',
  styleUrls: ['./hackathon-control-panel-dashboard.component.scss'],
})
export class HackathonControlPanelDashboardComponent implements OnInit, OnDestroy {
  hackathon: IHackathon;
  community: ICommunity;
  subscriptions: Subscription[] = [];
  icons = {
    faArrowLeft,
    faPenToSquare,
    faCircleInfo,
    faLink,
    faCalendarDays,
    faAward,
    faMicrophone,
    faSackDollar,
    faStar,
    faCircleQuestion,
    faEye,
    faChartPie,
    faHashtag,
    faEnvelope,
    faGamepad,
    faRectangleList,
    faArrowUpRightFromSquare,
    faBars,
  };

  hackathonStatuses: string[] = Object.values(EHackathonStatus);
  EHackathonStatus = EHackathonStatus;
  ESidebarWidth = ESidebarWidth;
  sidebarEventName = 'hackathonDashboard';
  sidebarExpanded = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private communitiesService: CommunitiesService,
    private hackathonService: HackathonService,
    private footerService: FooterService,
    private seoService: SeoService,
    public sidebarService: SidebarService,
  ) {}

  ngOnInit() {
    this.seoService.noIndex(true);
    this.footerService.changeMiniFooterStatus(false);
    this.activatedRoute.params.subscribe((params) => {
      const communityId = params['community_id'];
      const hackathonId = params['hackathon_id'];
      this.subscriptions.push(
        this.communitiesService.getCommunityDetails(communityId).subscribe((data) => {
          this.community = data;
        }),
      ),
        this.hackathonService.showHackathon(hackathonId).subscribe((data) => {
          this.hackathon = data;
        });
    });
    this.sidebarService.setSidebarVisibility(this.sidebarEventName, true);
    // eslint-disable-next-line no-prototype-builtins
    if (this.sidebarService.setSidebar$.hasOwnProperty(this.sidebarEventName)) {
      this.sidebarService.setSidebar$[this.sidebarEventName].subscribe((data) => {
        this.sidebarExpanded = data;
      });
    }
  }

  ngOnDestroy() {
    this.seoService.noIndex(false);
    this.footerService.changeMiniFooterStatus(true);
  }

  updateStatus(value) {
    this.hackathonService.updateHackathonStatus(this.hackathon.id, value).subscribe((data) => {
      if (data) {
        this.hackathon.status = data.status;
      }
    });
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebarVisibility(this.sidebarEventName);
  }
}
