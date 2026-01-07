import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IHackathon,
  IRound,
  EHackathonTeamRoundScoreStatus,
  IHackathonProblemStatement,
  EDbModels,
  IHackathonTeamWithScoreAndSubmissions,
} from '@commudle/shared-models';
import { HackathonTeamRoundScoreService, RoundService } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
import { Subject, takeUntil } from 'rxjs';
import { MentorScoringDialogComponent } from './mentor-scoring-dialog/mentor-scoring-dialog.component';
import moment from 'moment';

@Component({
  selector: 'commudle-public-hackathon-mentor-dashboard',
  templateUrl: './public-hackathon-mentor-dashboard.component.html',
  styleUrls: ['./public-hackathon-mentor-dashboard.component.scss'],
})
export class PublicHackathonMentorDashboardComponent implements OnInit, OnDestroy {
  hackathon: IHackathon;
  rounds: IRound[] = [];
  selectedRound: IRound;
  selectedRoundId: number;
  teamDetails: IHackathonTeamWithScoreAndSubmissions[] = [];
  isLoading = true;
  moment = moment;

  EHackathonTeamRoundScoreStatus = EHackathonTeamRoundScoreStatus;
  private destroy$ = new Subject<void>();

  @ViewChild('ProblemStatementView') problemStatementView: TemplateRef<any>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private hackathonTeamRoundScoreService: HackathonTeamRoundScoreService,
    private dialogService: NbDialogService,
    private roundService: RoundService,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.parent.data.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.hackathon = data.hackathon;
      this.fetchRounds();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchRounds() {
    this.roundService.pIndexRounds(this.hackathon.id, EDbModels.HACKATHON).subscribe((data) => {
      this.rounds = data;
      if (this.rounds.length > 0) {
        const now = moment();
        const ongoingRound = this.rounds.find((r) => now.isBetween(moment(r.date), moment(r.end_date), null, '[]'));
        const upcomingRound = this.rounds.find((r) => now.isBefore(moment(r.date)));
        this.selectedRound = ongoingRound || upcomingRound || this.rounds[0];
        this.selectedRoundId = this.selectedRound.id;
        this.fetchTeams();
      }
    });
  }

  fetchTeams() {
    this.hackathonTeamRoundScoreService.showDetails(this.hackathon.id, this.selectedRound.id).subscribe((data) => {
      this.teamDetails = data;
      this.isLoading = false;
    });
  }

  onRoundChange(event: any): void {
    this.isLoading = true;
    this.selectedRoundId = Number(event.target.value);
    this.selectedRound = this.rounds.find((r) => r.id === this.selectedRoundId);
    this.fetchTeams();
  }

  openScoringDialog(teamData: any): void {
    const dialogRef = this.dialogService.open(MentorScoringDialogComponent, {
      context: {
        teamData: teamData,
        hackathon: this.hackathon,
      },
    });

    dialogRef.onClose.pipe(takeUntil(this.destroy$)).subscribe((score) => {
      if (score) {
        this.teamDetails.find((team) => team.team.id === score.hackathon_team_id).score = score;
      }
    });
  }

  showProblemStatement(ps: IHackathonProblemStatement): void {
    this.dialogService.open(this.problemStatementView, {
      context: { ps },
    });
  }
}
