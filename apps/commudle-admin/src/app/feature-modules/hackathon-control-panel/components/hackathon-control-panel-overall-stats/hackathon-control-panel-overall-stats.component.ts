import { Component, OnInit } from '@angular/core';
import { NbRouteTab } from '@commudle/theme';

@Component({
    selector: 'commudle-hackathon-control-panel-overall-stats',
    templateUrl: './hackathon-control-panel-overall-stats.component.html',
    styleUrls: ['./hackathon-control-panel-overall-stats.component.scss'],
    standalone: false
})
export class HackathonControlPanelOverallStatsComponent implements OnInit {
  tabs: NbRouteTab[] = [
    {
      title: 'Stats',
      route: './',
    },
    {
      title: 'Emails Stats',
      route: ['./emails'],
    },
  ];
  constructor() {}

  ngOnInit() {}
}
