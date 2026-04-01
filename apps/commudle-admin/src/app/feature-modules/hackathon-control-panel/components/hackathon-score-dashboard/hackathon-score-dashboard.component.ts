import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HackathonTeamRoundScoreService, RoundService, SeoService } from '@commudle/shared-services';
import { EDbModels, IRound } from '@commudle/shared-models';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { IHackathon } from 'apps/shared-models/hackathon.model';
import { Subscription } from 'rxjs';
import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

interface IScoreRecord {
  id: number;
  team: { id: number; name: string; team_members_count: number };
  round: { id: number; name: string };
  total_score: number;
  score: { text: string; score: number }[];
  evaluator: { photo: any; username: string; name: string; email: string };
}

interface IRoundScoreCell {
  scores: {
    total_score: number;
    criteria: { text: string; score: number }[];
    evaluator_name: string;
  }[];
  best_score: number;
}

interface ITeamRow {
  rank: number;
  team_id: number;
  team_name: string;
  team_initials: string;
  members_count: number;
  round_cells: { [roundId: number]: IRoundScoreCell };
  total_score: number;
  avg_score: number;
}

@Component({
  selector: 'commudle-hackathon-score-dashboard',
  templateUrl: './hackathon-score-dashboard.component.html',
  styleUrls: ['./hackathon-score-dashboard.component.scss'],
  standalone: false,
})
export class HackathonScoreDashboardComponent implements OnInit, OnDestroy {
  hackathon: IHackathon;
  hackathonId: string;
  rounds: IRound[] = [];
  teamRows: ITeamRow[] = [];
  isLoading = true;

  // Pagination
  page = 1;
  count = 25;
  total = 0;

  // Filters (server-side)
  selectedRoundId: number = null;
  selectedEvaluatorId: number = null;
  minScore: number = null;

  // Unique evaluators from data
  allEvaluators: { id: number; name: string }[] = [];

  // Stats
  teamsShown = 0;
  topScore = 0;
  avgScore = 0;
  totalMembers = 0;

  icons = { faSortUp, faSortDown };
  subscriptions: Subscription[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private hackathonService: HackathonService,
    private scoreService: HackathonTeamRoundScoreService,
    private roundService: RoundService,
    private seoService: SeoService,
  ) {}

  ngOnInit(): void {
    this.seoService.noIndex(true);
    this.subscriptions.push(
      this.activatedRoute.parent.paramMap.subscribe((params) => {
        this.hackathonId = params.get('hackathon_id');
        this.fetchHackathon();
        this.fetchRounds();
        this.fetchScoreData();
      }),
    );
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  fetchHackathon(): void {
    this.subscriptions.push(
      this.hackathonService.showHackathon(this.hackathonId).subscribe((data: IHackathon) => {
        this.hackathon = data;
      }),
    );
  }

  fetchRounds(): void {
    this.subscriptions.push(
      this.roundService.indexRounds(this.hackathonId, EDbModels.HACKATHON).subscribe((data: IRound[]) => {
        this.rounds = data;
      }),
    );
  }

  fetchScoreData(): void {
    this.isLoading = true;
    this.subscriptions.push(
      this.scoreService
        .scoreDistributionIndex(
          this.hackathonId,
          this.page,
          this.count,
          this.selectedRoundId,
          this.selectedEvaluatorId,
          null,
          null,
          this.minScore,
        )
        .subscribe((response: any) => {
          const data = response?.data || response;
          const records: IScoreRecord[] = data?.values || [];
          this.total = data?.total || 0;
          this.processRecords(records);
          this.isLoading = false;
        }),
    );
  }

  processRecords(records: IScoreRecord[]): void {
    const evaluatorsMap = new Map<number, string>();
    const teamsMap = new Map<number, ITeamRow>();

    records.forEach((record) => {
      // Collect evaluators
      if (record.evaluator) {
        const evId = record.id; // use record id as evaluator key if no evaluator id
        evaluatorsMap.set(evId, record.evaluator.name);
      }

      // Group by team
      const teamId = record.team.id;
      if (!teamsMap.has(teamId)) {
        const initials = record.team.name
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase())
          .slice(0, 2)
          .join('');
        teamsMap.set(teamId, {
          rank: 0,
          team_id: teamId,
          team_name: record.team.name,
          team_initials: initials,
          members_count: record.team.team_members_count || 0,
          round_cells: {},
          total_score: 0,
          avg_score: 0,
        });
      }

      const teamRow = teamsMap.get(teamId);
      const roundId = record.round.id;

      if (!teamRow.round_cells[roundId]) {
        teamRow.round_cells[roundId] = { scores: [], best_score: 0 };
      }

      teamRow.round_cells[roundId].scores.push({
        total_score: record.total_score,
        criteria: record.score || [],
        evaluator_name: record.evaluator?.name || '',
      });

      if (record.total_score > teamRow.round_cells[roundId].best_score) {
        teamRow.round_cells[roundId].best_score = record.total_score;
      }
    });

    // Compute totals per team
    teamsMap.forEach((row) => {
      let totalScore = 0;
      let roundCount = 0;
      Object.values(row.round_cells).forEach((cell) => {
        totalScore += cell.best_score;
        roundCount++;
      });
      row.total_score = totalScore;
      row.avg_score = roundCount > 0 ? Math.round(totalScore / roundCount) : 0;
    });

    // Sort by total descending and assign ranks
    this.teamRows = Array.from(teamsMap.values()).sort((a, b) => b.total_score - a.total_score);
    this.teamRows.forEach((r, i) => (r.rank = i + 1));

    // Build evaluators list for filter
    this.allEvaluators = Array.from(new Set(records.map((r) => r.evaluator?.name).filter(Boolean))).map(
      (name, idx) => ({ id: idx, name }),
    );

    this.computeStats();
  }

  computeStats(): void {
    this.teamsShown = this.teamRows.length;
    this.topScore = this.teamRows.length > 0 ? Math.max(...this.teamRows.map((r) => r.total_score)) : 0;
    const sum = this.teamRows.reduce((s, r) => s + r.total_score, 0);
    this.avgScore = this.teamRows.length > 0 ? Math.round(sum / this.teamRows.length) : 0;
    this.totalMembers = this.teamRows.reduce((s, r) => s + r.members_count, 0);
  }

  onFilterChange(): void {
    this.page = 1;
    this.fetchScoreData();
  }

  clearFilters(): void {
    this.selectedRoundId = null;
    this.selectedEvaluatorId = null;
    this.minScore = null;
    this.page = 1;
    this.fetchScoreData();
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.fetchScoreData();
  }

  getCriteriaLabel(text: string): string {
    if (!text) return '';
    return text
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase())
      .join('');
  }
}
