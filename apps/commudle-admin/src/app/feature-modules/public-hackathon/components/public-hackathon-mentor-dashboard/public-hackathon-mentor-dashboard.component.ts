import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IHackathon, IRound, EHackathonTeamRoundScoreStatus, IHackathonTeamScore } from '@commudle/shared-models';
import { HackathonTeamRoundScoreService } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
import { Subject, takeUntil } from 'rxjs';
import { MentorScoringDialogComponent } from './mentor-scoring-dialog/mentor-scoring-dialog.component';

@Component({
  selector: 'commudle-public-hackathon-mentor-dashboard',
  templateUrl: './public-hackathon-mentor-dashboard.component.html',
  styleUrls: ['./public-hackathon-mentor-dashboard.component.scss'],
})
export class PublicHackathonMentorDashboardComponent implements OnInit, OnDestroy {
  hackathon: IHackathon;
  roundsData: any[] = [];
  rounds: IRound[] = [];
  selectedRoundId: number;
  selectedRound: IRound;
  filteredTeams: IHackathonTeamScore[] = [];
  isLoading = true;

  EHackathonTeamRoundScoreStatus = EHackathonTeamRoundScoreStatus;
  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private hackathonTeamRoundScoreService: HackathonTeamRoundScoreService,
    private dialogService: NbDialogService,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.parent.data.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.hackathon = data.hackathon;
      this.loadTeamsByRound();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTeamsByRound(): void {
    this.isLoading = true;
    this.hackathonTeamRoundScoreService
      .getTeamsByRound(this.hackathon.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.roundsData = data;
          this.rounds = data.map((item) => item.round);
          if (this.rounds.length > 0) {
            this.selectedRoundId = this.rounds[0].id;
            this.filterTeamsByRound();
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  filterTeamsByRound(): void {
    const roundData = this.roundsData.find((item) => item.round.id === this.selectedRoundId);
    this.filteredTeams = roundData ? roundData.teams : [];
    this.selectedRound = this.rounds.find((r) => r.id === this.selectedRoundId);
  }

  onRoundChange(event: any): void {
    this.selectedRoundId = Number(event.target.value);
    this.filterTeamsByRound();
  }

  openScoringDialog(teamData: IHackathonTeamScore): void {
    const dialogRef = this.dialogService.open(MentorScoringDialogComponent, {
      context: {
        teamData: teamData,
        hackathon: this.hackathon,
      },
    });

    dialogRef.onClose.pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        this.loadTeamsByRound();
      }
    });
  }
}
