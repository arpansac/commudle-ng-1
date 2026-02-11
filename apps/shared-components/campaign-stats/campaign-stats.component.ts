import { ActivatedRoute } from '@angular/router';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CampaignService, SeoService } from '@commudle/shared-services';
import { ECampaignStatus, ECampaignTypeSlug, ICampaign, ICampaignStats } from '@commudle/shared-models';
import { Chart } from 'chart.js';
declare let google: any;

@Component({
    selector: 'commudle-campaign-stats',
    templateUrl: './campaign-stats.component.html',
    styleUrls: ['./campaign-stats.component.scss'],
    standalone: false
})
export class CampaignStatsComponent implements OnInit {
  @Input() campaignId: number;
  campaign: ICampaign;
  campaignStats: ICampaignStats;
  @ViewChild('viewsOverDays') ViewsOverDaysChart: ElementRef<HTMLCanvasElement>;
  @ViewChild('clicksOverDays') ClicksOverDaysChart: ElementRef<HTMLCanvasElement>;
  @ViewChild('viewsOverTime') ViewsOverTimeChart: ElementRef<HTMLCanvasElement>;
  @ViewChild('clicksOverTime') ClicksOverTimeChart: ElementRef<HTMLCanvasElement>;
  @ViewChild('genderDistribution') GenderDistributionChart: ElementRef<HTMLCanvasElement>;

  constructor(private campaignService: CampaignService, private seoService: SeoService) {}

  ngOnInit() {
    this.fetchCampaigns();
  }

  fetchCampaigns() {
    this.campaignService.fetchCampaign(this.campaignId).subscribe((campaign) => {
      this.campaign = campaign;
      this.seoService.setTags(
        `${this.campaign.name} Campaign Stats`,
        `Stats dashboard for ${this.campaign.name}`,
        'https://commudle.com/assets/images/commudle-logo192.png',
      );
      if (this.campaign.main_newsletter_id && this.campaign.campaign_type.slug === ECampaignTypeSlug.MAIN_NEWSLETTER) {
        this.getNewsletterCampaignStats();
      }
      if (this.campaign.campaign_type.slug !== ECampaignTypeSlug.MAIN_NEWSLETTER) {
        this.getCampaignStats();
      }
    });
  }

  getNewsletterCampaignStats() {
    this.campaignService.getNewsletterStats(this.campaign.id).subscribe((stats: ICampaignStats) => {
      this.campaignStats = stats;
    });
  }

  getCampaignStats() {
    this.campaignService.getStats(this.campaign.id).subscribe((stats: ICampaignStats) => {
      this.campaignStats = stats;
      setTimeout(() => {
        this.viewsOverDays();
        this.clicksOverDays();
        this.viewsOverTime();
        this.clicksOverTime();
        this.genderDistribution();
        this.initMapChart();
      }, 0);
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
        labels: [
          `Male (${this.campaignStats.user_gender_distribution.male})`,
          `Female (${this.campaignStats.user_gender_distribution.female})`,
          `Prefer Not Answer (${this.campaignStats.user_gender_distribution.prefer_not_to_answer})`,
          `NA (${this.campaignStats.user_gender_distribution.NA})`,
        ],
      },
      options: {
        responsive: true,
      },
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
      ...this.campaignStats.user_locations.map((location) => [location[0], location[1]]),
    ]);

    const options = {
      displayMode: 'markers',
      resolution: 'countries', // Show countries instead of provinces
      colorAxis: { colors: ['#70a1ff', '#1e90ff'] }, // Gradient colors
      backgroundColor: '#f4f4f4', // Light grey background
      datalessRegionColor: '#dddddd', // Grey for areas with no data
      defaultColor: '#f00', // Default fill color
      tooltip: { textStyle: { color: '#333' }, showColorCode: true }, // Better tooltip
      enableRegionInteractivity: true,
      explorer: {
        actions: ['dragToZoom', 'rightClickToReset'], // Enable zoom and pan
        keepInBounds: true, // Prevent users from panning too far
        zoomDelta: 2, // Zoom step
      },
    };

    const chart = new google.visualization.GeoChart(document.getElementById('regions_div'));
    chart.draw(data, options);
  }
}
