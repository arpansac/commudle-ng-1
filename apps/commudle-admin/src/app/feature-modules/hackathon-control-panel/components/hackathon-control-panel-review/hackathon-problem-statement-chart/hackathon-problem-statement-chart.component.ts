import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { RandomColorsService } from 'apps/shared-services/random-colors.service';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-hackathon-problem-statement-chart',
  templateUrl: './hackathon-problem-statement-chart.component.html',
  styleUrls: ['./hackathon-problem-statement-chart.component.scss'],
  standalone: false,
})
export class HackathonProblemStatementChartComponent implements OnInit, OnDestroy {
  @Input() problemStatementDistribution: any[];
  private chart: Chart;

  constructor(private randomColorsService: RandomColorsService) {}

  ngOnInit(): void {
    setTimeout(() => this.drawChart(), 100);
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  drawChart(): void {
    if (!this.problemStatementDistribution || this.problemStatementDistribution.length === 0) {
      return;
    }

    const canvas = document.getElementById('psStatsChart') as HTMLCanvasElement;
    if (!canvas) {
      return;
    }

    const colors = this.randomColorsService.generateArray(this.problemStatementDistribution.length);

    this.chart = new Chart(canvas, {
      type: 'pie',
      data: {
        datasets: [
          {
            data: this.problemStatementDistribution.map((ps) => ps.teams_count),
            backgroundColor: colors,
          },
        ],
        labels: this.problemStatementDistribution.map(
          (ps) => `#${ps.problem_statement.display_id} (${ps.teams_count})`,
        ),
      },
      options: {
        responsive: true,
        legend: {
          display: false,
        },
      },
    });
  }
}
