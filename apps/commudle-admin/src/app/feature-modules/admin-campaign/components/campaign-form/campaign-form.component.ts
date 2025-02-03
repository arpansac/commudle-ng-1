import { Component, OnInit } from '@angular/core';
import { ESidebarWidth } from 'apps/shared-components/sidebar/enum/sidebar.enum';
import { faAnglesRight } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'commudle-campaign-form',
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.scss'],
})
export class CampaignFormComponent implements OnInit {
  ESidebarWidth = ESidebarWidth;
  sidebarEventName: string;

  icons = {
    faAnglesRight,
  };
  constructor() {
    this.sidebarEventName = 'campaignFormComponent';
  }

  ngOnInit() {}
}
