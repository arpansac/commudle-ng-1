import { ActivatedRoute } from '@angular/router';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CampaignService } from '@commudle/shared-services';
import { ICampaignStats } from '@commudle/shared-models';
import { Chart } from 'chart.js';

@Component({
  selector: 'commudle-campaign-stats',
  templateUrl: './campaign-stats.component.html',
  styleUrls: ['./campaign-stats.component.scss'],
})
export class CampaignStatsComponent implements OnInit {
  campaignStats: ICampaignStats;
  @ViewChild('viewsOverDays') ViewsOverDaysChart: ElementRef<HTMLCanvasElement>;
  @ViewChild('clicksOverDays') ClicksOverDaysChart: ElementRef<HTMLCanvasElement>;
  @ViewChild('viewsOverTime') ViewsOverTimeChart: ElementRef<HTMLCanvasElement>;
  @ViewChild('clicksOverTime') ClicksOverTimeChart: ElementRef<HTMLCanvasElement>;
  @ViewChild('genderDistribution') GenderDistributionChart: ElementRef<HTMLCanvasElement>;

  constructor(private route: ActivatedRoute, private campaignService: CampaignService) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.getCampaignStats(params['campaign_id']);
    });
  }

  getCampaignStats(campaignId: number) {
    this.campaignService.getStats(campaignId).subscribe((stats: ICampaignStats) => {
      this.campaignStats = stats;
      this.viewsOverDays();
      this.clicksOverDays();
      this.viewsOverTime();
      this.clicksOverTime();
      this.genderDistribution();
    });
  }

  viewsOverDays() {
    if (!this.ViewsOverDaysChart?.nativeElement || !this.campaignStats.views_over_days) {
      return;
    }

    new Chart(this.ViewsOverDaysChart.nativeElement, {
      type: 'bar',
      data: {
        labels: this.campaignStats.views_over_days.map((data) => data.x), // Extracting dates
        datasets: [
          {
            label: 'Views per Day',
            data: this.campaignStats.views_over_days.map((data) => data.y), // Extracting values
            backgroundColor: '#5072ff',
            borderColor: '#1f3bb3',
            borderWidth: 2,
            hoverBackgroundColor: '#1f3bb3',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              type: 'time',
              time: {
                unit: 'day',
                tooltipFormat: 'YYYY-MM-DD',
                displayFormats: {
                  day: 'YYYY-MM-DD',
                },
              },
              scaleLabel: {
                display: true,
                labelString: 'Date',
              },
              ticks: {
                autoSkip: true,
                maxRotation: 45,
                minRotation: 45,
              },
            },
          ],
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: 'Views Count',
              },
              ticks: {
                beginAtZero: false,
                stepSize: 5,
              },
            },
          ],
        },
        legend: {
          display: true,
          labels: {
            fontColor: '#333',
            fontSize: 14,
          },
        },
      },
    });
  }

  clicksOverDays() {
    if (!this.ClicksOverDaysChart?.nativeElement || !this.campaignStats.clicks_over_days) {
      return;
    }

    new Chart(this.ClicksOverDaysChart.nativeElement, {
      type: 'bar',
      data: {
        labels: this.campaignStats.clicks_over_days.map((data) => data.x), // Extracting dates
        datasets: [
          {
            label: 'Clicks per Day',
            data: this.campaignStats.clicks_over_days.map((data) => data.y), // Extracting values
            backgroundColor: '#5072ff',
            borderColor: '#1f3bb3',
            borderWidth: 2,
            hoverBackgroundColor: '#1f3bb3',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              type: 'time',
              time: {
                unit: 'day',
                tooltipFormat: 'YYYY-MM-DD',
                displayFormats: {
                  day: 'YYYY-MM-DD',
                },
              },
              scaleLabel: {
                display: true,
                labelString: 'Date',
              },
              ticks: {
                autoSkip: true,
                maxRotation: 45,
                minRotation: 45,
              },
            },
          ],
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: 'Clicks Count',
              },
              ticks: {
                beginAtZero: false,
                stepSize: 5,
              },
            },
          ],
        },
        legend: {
          display: true,
          labels: {
            fontColor: '#333',
            fontSize: 14,
          },
        },
      },
    });
  }

  viewsOverTime() {
    if (!this.ViewsOverTimeChart?.nativeElement || !this.campaignStats.views_over_time) {
      return;
    }
    new Chart(this.ViewsOverTimeChart.nativeElement, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Views Over Time',
            data: this.campaignStats.views_over_time.map((item) => ({
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
                labelString: 'Views',
              },
            },
          ],
        },
      },
    });
  }

  clicksOverTime() {
    if (!this.ClicksOverTimeChart?.nativeElement || !this.campaignStats.clicks_over_time) {
      return;
    }
    new Chart(this.ClicksOverTimeChart.nativeElement, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Views Over Time',
            data: this.campaignStats.clicks_over_time.map((item) => ({
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
                labelString: 'Clicks',
              },
            },
          ],
        },
      },
    });
  }

  genderDistribution() {
    if (!this.GenderDistributionChart?.nativeElement || !this.campaignStats.user_gender_distribution) {
      return;
    }

    return new Chart(this.GenderDistributionChart.nativeElement, {
      type: 'pie',
      data: {
        datasets: [
          {
            data: [
              this.campaignStats.user_gender_distribution.male,
              this.campaignStats.user_gender_distribution.female,
              this.campaignStats.user_gender_distribution.prefer_not_to_answer,
              this.campaignStats.user_gender_distribution.NA,
            ],
            backgroundColor: ['blue', '#ff43bc', 'purple', 'green'],
          },
        ],

        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: ['Male', 'Female', 'Prefer Not Answer', 'NA'],
      },
      options: {
        responsive: true,
      },
    });
  }
}
