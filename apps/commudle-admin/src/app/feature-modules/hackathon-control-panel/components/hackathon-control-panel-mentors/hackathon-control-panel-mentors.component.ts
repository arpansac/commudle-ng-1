import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { faPlus, faMinus, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { EDbModels, IHackathonTeam, IRound } from '@commudle/shared-models';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { ToastrService, SeoService, RoundService, HackathonTeamRoundScoreService } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
import { EHackathonJudgeType, IHackathonJudge } from 'apps/shared-models/hackathon-judge.model';

@Component({
  selector: 'commudle-hackathon-control-panel-mentors',
  templateUrl: './hackathon-control-panel-mentors.component.html',
  styleUrls: ['./hackathon-control-panel-mentors.component.scss'],
})
export class HackathonControlPanelMentorsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  hackathonId: string;
  mentors: IHackathonJudge[] = [];
  teams: IHackathonTeam[] = [];
  rounds: IRound[] = [];
  selectedRound: IRound;
  mentorAssignments: Map<number, number[]> = new Map();
  isLoading = false;

  readonly icons = {
    faPlus,
    faMinus,
    faArrowRight,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private hackathonService: HackathonService,
    private roundService: RoundService,
    private toastrService: ToastrService,
    private seoService: SeoService,
    private dialogService: NbDialogService,
    private hackathonTeamRoundScoreService: HackathonTeamRoundScoreService,
  ) {}

  ngOnInit(): void {
    this.seoService.noIndex(true);
    this.activatedRoute.parent.parent.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.hackathonId = params.get('hackathon_id');
      this.loadRounds();
      this.loadMentors();
    });
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMentors(): void {
    this.hackathonService
      .indexJudge(this.hackathonId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.mentors = data.filter((judge) => judge.judge_type === EHackathonJudgeType.MENTOR);
      });
  }

  loadRounds(): void {
    this.roundService
      .indexRounds(this.hackathonId, EDbModels.HACKATHON)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.rounds = data;
        this.autoSelectUpcomingRound();
      });
  }

  autoSelectUpcomingRound(): void {
    if (this.rounds.length === 0) return;

    const now = new Date();
    const upcomingRound = this.rounds.find((round) => new Date(round.date) >= now);

    if (upcomingRound) {
      this.selectedRound = upcomingRound;
      this.loadTeamsByRound(upcomingRound.id);
    } else {
      this.selectedRound = this.rounds[this.rounds.length - 1];
      this.loadTeamsByRound(this.selectedRound.id);
    }
  }

  onRoundChange(roundId: number): void {
    if (!roundId) return;
    this.selectedRound = this.rounds.find((r) => r.id === roundId);
    if (this.selectedRound) {
      this.loadTeamsByRound(roundId);
    }
  }

  loadTeamsByRound(roundId: number): void {
    this.isLoading = true;
    this.hackathonService
      .indexUserResponses(this.hackathonId, 1, 1000, '', roundId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.teams = data.values.map((response) => response.team);
          console.log('🚀 ~ HackathonControlPanelMentorsComponent ~ loadTeamsByRound ~ this.teams:', this.teams);
          this.loadExistingAssignments();
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.toastrService.warningDialog('Failed to load teams');
        },
      });
  }

  loadExistingAssignments(): void {
    this.hackathonTeamRoundScoreService
      .index(this.hackathonId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (scores) => {
          this.mentorAssignments.clear();
          scores
            .filter((score) => score.round_id === this.selectedRound?.id)
            .forEach((score) => {
              const teams = this.mentorAssignments.get(score.evaluator_id) || [];
              if (!teams.includes(score.hackathon_team_id)) {
                teams.push(score.hackathon_team_id);
                this.mentorAssignments.set(score.evaluator_id, teams);
              }
            });
        },
        error: (err) => {
          console.error('Failed to load assignments:', err);
        },
      });
  }

  addTeamToMentor(mentorId: number, teamId: number): void {
    if (!this.selectedRound) return;

    this.hackathonTeamRoundScoreService
      .assignJudge(mentorId, teamId, this.selectedRound.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const teams = this.mentorAssignments.get(mentorId) || [];
          if (!teams.includes(teamId)) {
            teams.push(teamId);
            this.mentorAssignments.set(mentorId, teams);
          }
          this.toastrService.successDialog('Team assigned successfully');
        },
        error: () => {
          this.toastrService.warningDialog('Failed to assign team');
        },
      });
  }

  removeTeamFromMentor(mentorId: number, teamId: number): void {
    const teams = this.mentorAssignments.get(mentorId) || [];
    const index = teams.indexOf(teamId);
    if (index > -1) {
      teams.splice(index, 1);
      this.mentorAssignments.set(mentorId, teams);
    }
  }

  getAssignedTeams(mentorId: number): IHackathonTeam[] {
    const teamIds = this.mentorAssignments.get(mentorId) || [];
    return this.teams.filter((team) => teamIds.includes(team.id));
  }

  getUnassignedTeams(mentorId: number): IHackathonTeam[] {
    const teamIds = this.mentorAssignments.get(mentorId) || [];
    return this.teams.filter((team) => !teamIds.includes(team.id));
  }

  shiftTeamsToNextRound(): void {
    if (!this.selectedRound) {
      this.toastrService.warningDialog('Please select a round first');
      return;
    }

    const currentRoundIndex = this.rounds.findIndex((r) => r.id === this.selectedRound.id);
    if (currentRoundIndex === -1 || currentRoundIndex === this.rounds.length - 1) {
      this.toastrService.warningDialog('No next round available');
      return;
    }

    const nextRound = this.rounds[currentRoundIndex + 1];
    this.isLoading = true;

    const promises = this.teams.map((team) => this.hackathonService.changeTeamRound(team.id, nextRound.id).toPromise());

    Promise.all(promises)
      .then(() => {
        this.toastrService.successDialog('Teams shifted to next round successfully');
        this.selectedRound = nextRound;
        this.loadTeamsByRound(nextRound.id);
      })
      .catch(() => {
        this.isLoading = false;
        this.toastrService.warningDialog('Failed to shift teams');
      });
  }
}
