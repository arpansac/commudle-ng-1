import { ActivatedRoute } from '@angular/router';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
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
export class CampaignStatsComponent implements OnInit, OnChanges {
  @Input() campaignId: string;
  campaign: ICampaign;
  campaignStats: ICampaignStats;
  campaignStatsTimeseries: ICampaignStats;
  // @ViewChild('viewsOverDays') ViewsOverDaysChart: ElementRef<HTMLCanvasElement>;
  @ViewChild('clicksOverDays') ClicksOverDaysChart: ElementRef<HTMLCanvasElement>;
  // @ViewChild('viewsOverTime') ViewsOverTimeChart: ElementRef<HTMLCanvasElement>;
  @ViewChild('clicksOverTime') ClicksOverTimeChart: ElementRef<HTMLCanvasElement>;
  @ViewChild('genderDistribution') GenderDistributionChart: ElementRef<HTMLCanvasElement>;

  constructor(private campaignService: CampaignService, private seoService: SeoService) {}

  ngOnInit() {
    if (this.campaignId) this.fetchCampaigns();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['campaignId'] && this.campaignId) this.fetchCampaigns();
  }

  fetchCampaigns() {
    if (!this.campaignId) return;
    this.campaignService.fetchCampaign(this.campaignId).subscribe((campaign) => {
      this.campaign = campaign;
      this.getStatsUserDistribution();
      this.getStatsTimeseries();
      this.seoService.setTags(
        `${this.campaign.name} Campaign Stats`,
        `Stats dashboard for ${this.campaign.name}`,
        'https://commudle.com/assets/images/commudle-logo192.png',
      );
    });
  }

  getStatsUserDistribution() {
    this.campaignService.getStatsUserDistribution(this.campaignId).subscribe((stats: ICampaignStats) => {
      this.campaignStats = stats;
      setTimeout(() => {
        this.genderDistribution();
        this.initMapChart();
      }, 0);
    });
  }

  getStatsTimeseries() {
    this.campaignService.getStatsTimeseries(this.campaignId).subscribe((stats: ICampaignStats) => {
      this.campaignStatsTimeseries = stats;
      setTimeout(() => {
        this.clicksOverTime();
        this.clicksOverDays();
        // this.viewsOverDays();
        // this.viewsOverTime();
      }, 0);
    });
  }

  // viewsOverDays() {
  //   if (!this.ViewsOverDaysChart?.nativeElement || !this.campaignStats.views_over_days) {
  //     return;
  //   }

  //   new Chart(this.ViewsOverDaysChart.nativeElement, {
  //     type: 'bar',
  //     data: {
  //       labels: this.campaignStats.views_over_days.map((data) => data.x), // Extracting dates
  //       datasets: [
  //         {
  //           label: 'Views per Day',
  //           data: this.campaignStats.views_over_days.map((data) => data.y), // Extracting values
  //           backgroundColor: '#5072ff',
  //           borderColor: '#1f3bb3',
  //           borderWidth: 2,
  //           hoverBackgroundColor: '#1f3bb3',
  //         },
  //       ],
  //     },
  //     options: {
  //       responsive: true,
  //       maintainAspectRatio: false,
  //       scales: {
  //         xAxes: [
  //           {
  //             type: 'time',
  //             time: {
  //               unit: 'day',
  //               tooltipFormat: 'YYYY-MM-DD',
  //               displayFormats: {
  //                 day: 'YYYY-MM-DD',
  //               },
  //             },
  //             scaleLabel: {
  //               display: true,
  //               labelString: 'Date',
  //             },
  //             ticks: {
  //               autoSkip: true,
  //               maxRotation: 45,
  //               minRotation: 45,
  //             },
  //           },
  //         ],
  //         yAxes: [
  //           {
  //             scaleLabel: {
  //               display: true,
  //               labelString: 'Views Count',
  //             },
  //             ticks: {
  //               beginAtZero: false,
  //               stepSize: 5,
  //             },
  //           },
  //         ],
  //       },
  //       legend: {
  //         display: true,
  //         labels: {
  //           fontColor: '#333',
  //           fontSize: 14,
  //         },
  //       },
  //     },
  //   });
  // }

  clicksOverDays() {
    const source = this.campaignStatsTimeseries.ctr as any;

    if (!this.ClicksOverDaysChart?.nativeElement || !source) {
      return;
    }

    new Chart(this.ClicksOverDaysChart.nativeElement, {
      type: 'bar',
      data: {
        labels: source.map((data) => data.date), // Extracting dates
        datasets: [
          {
            label: 'Clicks Over Days',
            data: source.map((data) => data.value), // Extracting values
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

  // viewsOverTime() {
  //   if (!this.ViewsOverTimeChart?.nativeElement || !this.campaignStats.views_over_time) {
  //     return;
  //   }
  //   new Chart(this.ViewsOverTimeChart.nativeElement, {
  //     type: 'line',
  //     data: {
  //       datasets: [
  //         {
  //           label: 'Views Over Time',
  //           data: this.campaignStats.views_over_time.map((item) => ({
  //             t: new Date(item.x), // Chart.js 2.x uses 't' instead of 'x' for time
  //             y: item.y,
  //           })),
  //           borderColor: '#5072ff',
  //           backgroundColor: 'rgba(80, 114, 255, 0.2)',
  //           borderWidth: 2,
  //           pointBackgroundColor: '#1f3bb3',
  //           pointRadius: 5,
  //           fill: true,
  //         },
  //       ],
  //     },
  //     options: {
  //       responsive: true,
  //       maintainAspectRatio: false,
  //       scales: {
  //         xAxes: [
  //           {
  //             type: 'time', // Use 'time' scale
  //             time: {
  //               unit: 'hour', // Display by hour
  //               tooltipFormat: 'YYYY-MM-DD HH:mm',
  //               displayFormats: { hour: 'HH:mm' },
  //             },
  //             scaleLabel: {
  //               display: true,
  //               labelString: 'Time (Hourly)',
  //             },
  //           },
  //         ],
  //         yAxes: [
  //           {
  //             ticks: {
  //               beginAtZero: false,
  //               stepSize: 5,
  //             },
  //             scaleLabel: {
  //               display: true,
  //               labelString: 'Views',
  //             },
  //           },
  //         ],
  //       },
  //     },
  //   });
  // }

  clicksOverTime() {
    const raw = this.campaignStatsTimeseries && (this.campaignStatsTimeseries as any)?.clicks;
    const el = this.ClicksOverTimeChart?.nativeElement;
    if (!el || !raw.length) return;

    const data = raw.map((p: { date?: string; value?: number; x?: string; y?: number }) => ({
      t: new Date((p.date ?? p.x) || 0),
      y: Number(p.value ?? p.y ?? 0),
    }));

    new Chart(el, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Clicks Over Days',
            data,
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
              type: 'time',
              time: {
                unit: 'day',
                tooltipFormat: 'YYYY-MM-DD',
                displayFormats: { day: 'MMM D', week: 'MMM D' },
              },
              scaleLabel: { display: true, labelString: 'Date' },
            },
          ],
          yAxes: [
            {
              ticks: { beginAtZero: true, stepSize: 1 },
              scaleLabel: { display: true, labelString: 'Clicks' },
            },
          ],
        },
      },
    });
  }

  genderDistribution() {
    const gender = this.campaignStats?.gender;
    if (!this.GenderDistributionChart?.nativeElement || !gender) {
      return;
    }

    return new Chart(this.GenderDistributionChart.nativeElement, {
      type: 'pie',
      data: {
        datasets: [
          {
            data: [gender.male, gender.female, gender.prefer_not_to_answer, gender.NA],
            backgroundColor: ['blue', '#ff43bc', 'purple', 'green'],
          },
        ],
        labels: [
          `Male (${gender.male})`,
          `Female (${gender.female})`,
          `Prefer Not Answer (${gender.prefer_not_to_answer})`,
          `NA (${gender.NA})`,
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
      ...this.campaignStats.locations.map((location) => [location[0], location[1]]),
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
