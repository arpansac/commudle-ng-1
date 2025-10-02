import { Component } from '@angular/core';

@Component({
    selector: 'commudle-admin-campaigns',
    templateUrl: './admin-campaigns.component.html',
    styleUrls: ['./admin-campaigns.component.scss'],
    standalone: false
})
export class AdminCampaignsComponent {
  tabs = [
    {
      title: 'All Campaigns',
      route: './',
    },
    {
      title: 'Campaign Types',
      route: 'types',
    },
    {
      title: 'Purchase Orders',
      route: 'purchase-orders',
    },
  ];
}
