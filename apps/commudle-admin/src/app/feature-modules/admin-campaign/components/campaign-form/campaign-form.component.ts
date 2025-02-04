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
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'commudle-campaign-form',
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.scss'],
})
export class CampaignFormComponent implements OnInit {
  ESidebarWidth = ESidebarWidth;
  sidebarEventName: string;
  lastSegment: string;
  icons = {
    faAnglesRight,
    faArrowLeft,
    faUser,
    faCircleInfo,
    faCalendar,
    faSackDollar,
    faFileImage,
  };
  constructor() {
    this.sidebarEventName = 'campaignFormComponent';
  }

  ngOnInit() {
    this.lastSegment = window.location.pathname.split('/').pop();
  }
}
