import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'commudle-admin-campaigns',
  templateUrl: './admin-campaigns.component.html',
  styleUrls: ['./admin-campaigns.component.scss'],
})
export class AdminCampaignsComponent implements OnInit {
  tabs = [
    {
      title: 'All Campaigns',
      route: './',
    },
    {
      title: 'Campaign Types',
      route: 'types',
    },
  ];
  constructor() {}

  ngOnInit() {}
}
