import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HackathonTeamRoundScoreService, RoundService, SeoService } from '@commudle/shared-services';
import { EDbModels, IRound, IRoundScores, ITeamRow } from '@commudle/shared-models';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { IHackathon } from 'apps/shared-models/hackathon.model';
import { Subscription } from 'rxjs';
import { faChevronDown, faChevronUp, faUser } from '@fortawesome/free-solid-svg-icons';

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

  page = 1;
  count = 15;
  total = 0;

  selectedRoundId: number = null;
  minScore: number = null;

  teamsShown = 0;
  topScore = 0;
  globalTopScore: number = null;
  avgScore = 0;
  totalEvaluations = 0;

  icons = { faChevronDown, faChevronUp, faUser };
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
          // null,
          // null,
          // null,
          // this.minScore,
        )
        .subscribe((response: any) => {
          const records = response?.teams || [];
          this.total = response?.total || 0;
          this.page = response?.page || 1;
          this.processRecords(records);
          if (this.globalTopScore === null && this.teamRows.length > 0) {
            this.globalTopScore = this.teamRows[0].total_score;
          }
          this.isLoading = false;
        }),
    );
  }

  processRecords(records: any[]): void {
    this.teamRows = records.map((record) => {
      const team = record.team;
      const scores: any[] = record.scores || [];
      const roundsMap = new Map<number, IRoundScores>();

      scores.forEach((s) => {
        const roundId = s.round.id;
        if (!roundsMap.has(roundId)) {
          roundsMap.set(roundId, {
            round_id: roundId,
            round_name: s.round.name,
            evaluator_scores: [],
            avg_score: 0,
            best_score: 0,
          });
        }

        const criteria = s.score
          ? Object.entries(s.score).map(([text, score]) => ({ text, score: score as number }))
          : [];

        roundsMap.get(roundId).evaluator_scores.push({
          evaluator_name: s.evaluator?.name || 'Unknown',
          evaluator_photo: s.evaluator?.photo?.i32 || '',
          total_score: s.total_score,
          round_name: s.round.name,
          criteria,
        });
      });

      const rounds = Array.from(roundsMap.values()).sort((a, b) => a.round_id - b.round_id);
      let totalEvals = 0;
      rounds.forEach((rd) => {
        const vals = rd.evaluator_scores.map((e) => e.total_score);
        rd.best_score = Math.max(...vals);
        rd.avg_score = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
        totalEvals += vals.length;
      });

      const totalScore = record.total_team_score ?? 0;

      return {
        rank: 0,
        team_id: team.id,
        team_name: team.name,
        members_count: team.team_members_count || 0,
        rounds,
        total_score: totalScore,
        avg_score: rounds.length > 0 ? Math.round(totalScore / rounds.length) : 0,
        total_evaluations: totalEvals,
        expanded: false,
      } as ITeamRow;
    });

    this.teamRows.sort((a, b) => b.total_score - a.total_score);
    this.teamRows.forEach((r, i) => (r.rank = (this.page - 1) * this.count + i + 1));
    this.computeStats();
  }

  computeStats(): void {
    this.teamsShown = this.teamRows.length;
    this.topScore = this.globalTopScore ?? (this.teamRows.length > 0 ? this.teamRows[0].total_score : 0);
    const sum = this.teamRows.reduce((s, r) => s + r.total_score, 0);
    this.avgScore = this.teamRows.length > 0 ? Math.round(sum / this.teamRows.length) : 0;
    this.totalEvaluations = this.teamRows.reduce((s, r) => s + r.total_evaluations, 0);
  }

  toggleExpand(row: ITeamRow): void {
    row.expanded = !row.expanded;
  }

  onFilterChange(): void {
    this.page = 1;
    this.globalTopScore = null;
    this.fetchScoreData();
  }

  clearFilters(): void {
    this.selectedRoundId = null;
    this.minScore = null;
    this.page = 1;
    this.globalTopScore = null;
    this.fetchScoreData();
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.fetchScoreData();
  }
}
