import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IHackathon, EParticipateTypes } from '@commudle/shared-models';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { StatsHackathonService } from 'apps/commudle-admin/src/app/services/stats/hackathons.service';
import Chart from 'chart.js';
declare let google: any;

@Component({
  selector: 'commudle-hackathon-control-panel-stats',
  templateUrl: './hackathon-control-panel-stats.component.html',
  styleUrls: ['./hackathon-control-panel-stats.component.scss'],
})
export class HackathonControlPanelStatsComponent implements OnInit {
  private hackathonId: string;
  hackathonTeamStats: any;
  hackathonUserResponsesTags: any;
  hackathonUserLocationsForParticipants: any;
  userVisitStats: any;
  hackathon: IHackathon;
  EParticipateTypes = EParticipateTypes;
  @ViewChild('genderDistribution') GenderDistributionChart: ElementRef<HTMLCanvasElement>;
  @ViewChild('hackathonTeamOverTime') HackathonTeamOverTimeChart: ElementRef<HTMLCanvasElement>;
  @ViewChild('hackathonUserVisitOverDays') HackathonUserVisitOverDays: ElementRef<HTMLCanvasElement>;
  constructor(
    private route: ActivatedRoute,
    private statsHackathonService: StatsHackathonService,
    private hackathonService: HackathonService,
  ) {}

  ngOnInit() {
    this.route.parent.paramMap.subscribe((params) => {
      this.hackathonId = params.get('hackathon_id');
      this.hackathonService.showHackathon(this.hackathonId).subscribe((hackathon) => {
        this.hackathon = hackathon;
      });
      this.getGenderDistributionChart();
      this.getHackathonTeamStats();
      this.getHackathonUserResponsesTags();
      this.getHackathonTeamOverTime();
      this.getHackathonUserVisits();
      this.getHackathonUserLocation();
    });
  }

  getGenderDistributionChart() {
    this.statsHackathonService.genderDistribution(this.hackathonId).subscribe((data) => {
      const userGenderDistribution = data.gender_distribution;
      if (!this.GenderDistributionChart?.nativeElement || !userGenderDistribution) {
        return;
      }

      return new Chart(this.GenderDistributionChart.nativeElement, {
        type: 'pie',
        data: {
          datasets: [
            {
              data: [
                userGenderDistribution.male,
                userGenderDistribution.female,
                userGenderDistribution.prefer_not_to_answer,
                userGenderDistribution.NA,
              ],
              backgroundColor: ['blue', '#ff43bc', 'purple', 'green'],
            },
          ],

          labels: [
            `Male ${userGenderDistribution.male}`,
            `Female  ${userGenderDistribution.female}`,
            `Prefer Not Answer  ${userGenderDistribution.prefer_not_to_answer}`,
            `NA  ${userGenderDistribution.NA}`,
          ],
        },
        options: {
          responsive: true,
        },
      });
    });
  }

  getHackathonTeamOverTime() {
    this.statsHackathonService.hackathonTeamOverTime(this.hackathonId).subscribe((data) => {
      const hackathonTeamOverTime = data.hackathon_team_over_time;
      if (!this.HackathonTeamOverTimeChart?.nativeElement || !hackathonTeamOverTime) {
        return;
      }
      new Chart(this.HackathonTeamOverTimeChart.nativeElement, {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'Registration Over Time',
              data: hackathonTeamOverTime.map((item) => ({
                t: new Date(item.x), // Chart.js 2.x uses 't' instead of 'x' for time
                y: item.y,
              })),
              borderColor: '#5072ff',
              backgroundColor: 'rgba(80, 114, 255, 0.2)',
              borderWidth: 2,
              pointBackgroundColor: '#1f3bb3',
              pointRadius: 5,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            xAxes: [
              {
                type: 'time', // Use 'time' scale
                time: {
                  unit: 'hour', // Display by hour
                  tooltipFormat: 'YYYY-MM-DD HH:mm',
                  displayFormats: { hour: 'HH:mm' },
                },
                scaleLabel: {
                  display: true,
                  labelString: 'Time (Hourly)',
                },
              },
            ],
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                  stepSize: 5,
                },
                scaleLabel: {
                  display: true,
                  labelString: 'Count',
                },
              },
            ],
          },
        },
      });
    });
  }

  getHackathonTeamStats() {
    this.statsHackathonService.hackathonTeamStats(this.hackathonId).subscribe((data) => {
      this.hackathonTeamStats = data;
    });
  }

  getHackathonUserResponsesTags() {
    this.statsHackathonService.hackathonUserResponsesTags(this.hackathonId).subscribe((data) => {
      this.hackathonUserResponsesTags = data;
    });
  }

  getHackathonUserVisits() {
    this.statsHackathonService.hackathonUserVisits(this.hackathonId).subscribe((data) => {
      this.userVisitStats = data.user_visits;
      const hackathonTeamOverTime = data.user_visits.over_date;
      if (!this.HackathonUserVisitOverDays?.nativeElement || !hackathonTeamOverTime) {
        return;
      }
      new Chart(this.HackathonUserVisitOverDays.nativeElement, {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'Views Over Time',
              data: hackathonTeamOverTime.map((item) => ({
                t: new Date(item.x), // Ensure this is in 'YYYY-MM-DD' format
                y: item.y,
              })),
              borderColor: '#5072ff',
              backgroundColor: 'rgba(80, 114, 255, 0.2)',
              borderWidth: 2,
              pointBackgroundColor: '#1f3bb3',
              pointRadius: 5,
              lineTension: 0.4, // Smooth curve
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            xAxes: [
              {
                type: 'time', // Time scale for proper date parsing
                time: {
                  unit: 'day', // Display by day
                  tooltipFormat: 'YYYY-MM-DD', // Tooltip will show full date
                  displayFormats: { day: 'YYYY-MM-DD' }, // Axis label format
                },
                scaleLabel: {
                  display: true,
                  labelString: 'Date (Daily)',
                },
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 7, // Adjust this to control the number of visible dates
                },
              },
            ],
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                  stepSize: 5,
                },
                scaleLabel: {
                  display: true,
                  labelString: 'Views',
                },
              },
            ],
          },
          legend: {
            display: true,
            position: 'top',
          },
          tooltips: {
            mode: 'index',
            intersect: false,
          },
        },
      });
    });
  }

  getHackathonUserLocation() {
    this.statsHackathonService.hackathonUserLocations(this.hackathonId).subscribe((data) => {
      if (data) {
        this.hackathonUserLocationsForParticipants = data;

        this.initMapChart();
      }
    });
  }

  initMapChart() {
    google.charts.load('current', {
      packages: ['geochart'],
    });
    google.charts.setOnLoadCallback(this.drawRegionsMap.bind(this));
  }

  drawRegionsMap() {
    const data = google.visualization.arrayToDataTable([
      ['Region', 'Popularity'],
      ...this.hackathonUserLocationsForParticipants.user_locations.map((location) => [location[0], location[1]]),
    ]);

    const options = {
      displayMode: 'markers',
      region: 'IN', // Focus on India
      resolution: 'provinces', // Highlights states instead of individual points
      colorAxis: { colors: ['#70a1ff', '#1e90ff'] }, // Gradient colors
      backgroundColor: '#f4f4f4', // Light grey background
      datalessRegionColor: '#dddddd', // Grey for areas with no data
      defaultColor: '#f00', // Default fill color
      tooltip: { textStyle: { color: '#333' }, showColorCode: true }, // Better tooltip
      enableRegionInteractivity: true,
      explorer: {
        actions: ['dragToZoom', 'rightClickToReset'], // Enable zoom and pan
        keepInBounds: true, // Prevent users from panning too far
        zoomDelta: 1.2, // Zoom step
      },
    };

    const chart = new google.visualization.GeoChart(document.getElementById('regions_div'));
    chart.draw(data, options);
  }
}
