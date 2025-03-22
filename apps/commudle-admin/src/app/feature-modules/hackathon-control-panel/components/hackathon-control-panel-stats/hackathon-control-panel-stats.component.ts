import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StatsHackathonService } from 'apps/commudle-admin/src/app/services/stats/hackathons.service';

@Component({
  selector: 'commudle-hackathon-control-panel-stats',
  templateUrl: './hackathon-control-panel-stats.component.html',
  styleUrls: ['./hackathon-control-panel-stats.component.scss'],
})
export class HackathonControlPanelStatsComponent implements OnInit {
  private hackathonId: string;
  constructor(private route: ActivatedRoute, private statsHackathonService: StatsHackathonService) {}

  ngOnInit() {
    this.route.parent.paramMap.subscribe((params) => {
      this.hackathonId = params['hackathon_id'];
      console.log('🚀 ~ HackathonControlPanelStatsComponent ~ this.route.parent.paramMap.subscribe ~ params:', params);
    });
  }

  getGenderDistributionChart() {
    this.statsHackathonService.genderDistribution(this.hackathonId).subscribe((data) => {});
  }

  getHackathonTeamStatsChart() {
    this.statsHackathonService.hackathonTeamOverTime(this.hackathonId).subscribe((data) => {});
  }

  getHackathonUserResponsesTags() {
    this.statsHackathonService.hackathonTeamStats(this.hackathonId).subscribe((data) => {});
  }

  getHackathonTeamOverTime() {
    this.statsHackathonService.hackathonUserResponsesTags(this.hackathonId).subscribe((data) => {});
  }
}
