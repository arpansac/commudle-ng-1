import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IHackathon,
  IRound,
  EHackathonTeamRoundScoreStatus,
  IHackathonProblemStatement,
  EDbModels,
  IHackathonTeamWithScoreAndSubmissions,
  IHackathonJudge,
  EHackathonJudgeType,
  EJudgeInvitationStatus,
  IRoundMentorSlot,
  ERoundMentorSlotStatus,
  IHackathonTeam,
} from '@commudle/shared-models';
import {
  HackathonTeamRoundScoreService,
  RoundService,
  AuthService,
  RoundMentorSlotService,
  HackathonTeamService,
  RoundMentorSlotBookingService,
  ToastrService,
} from '@commudle/shared-services';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { NbDialogService } from '@commudle/theme';
import { Subject, takeUntil } from 'rxjs';
import { MentorScoringDialogComponent } from './mentor-scoring-dialog/mentor-scoring-dialog.component';
import moment from 'moment';
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';

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
  currentMentor: IHackathonJudge;
  EHackathonTeamRoundScoreStatus = EHackathonTeamRoundScoreStatus;
  roundMentorSlots: IRoundMentorSlot[];
  availableTeams: IHackathonTeam[] = [];
  selectedSlot: IRoundMentorSlot;
  selectedSlotIndex: number;

  protected ERoundMentorSlotStatus = ERoundMentorSlotStatus;

  private destroy$ = new Subject<void>();

  protected readonly icons = {
    faPlus,
    faXmark,
  };

  @ViewChild('ProblemStatementView') problemStatementView: TemplateRef<any>;
  @ViewChild('addTeamDialog') addTeamDialog: TemplateRef<any>;
  @ViewChild('cancelSlotDialog') cancelSlotDialog: TemplateRef<any>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private hackathonTeamRoundScoreService: HackathonTeamRoundScoreService,
    private dialogService: NbDialogService,
    private roundService: RoundService,
    private hackathonService: HackathonService,
    private authService: AuthService,
    private roundMentorSlotService: RoundMentorSlotService,
    private hackathonTeamService: HackathonTeamService,
    private roundMentorSlotBookingService: RoundMentorSlotBookingService,
    private toastrService: ToastrService,
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
        this.loadCurrentMentor();

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
    this.loadMentorSlots();
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

  loadCurrentMentor(): void {
    this.authService.currentUser$.subscribe((user) => {
      const currentUserId = user.id;
      this.hackathonService
        .indexJudge(this.hackathon.id, [EHackathonJudgeType.MENTOR], EJudgeInvitationStatus.ACCEPTED)
        .pipe(takeUntil(this.destroy$))
        .subscribe((mentors) => {
          this.currentMentor = mentors.find((m) => m.judge_user_id === currentUserId);
          this.loadMentorSlots();
        });
    });
  }

  loadMentorSlots(): void {
    if (!this.currentMentor) return;
    this.roundMentorSlotService
      .indexByRoundMentor(this.selectedRound.id, this.currentMentor.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((slots) => {
        this.roundMentorSlots = slots;
      });
  }

  openAddTeamDialog(slot: IRoundMentorSlot, index: number): void {
    this.selectedSlot = slot;
    this.selectedSlotIndex = index;
    this.loadAvailableTeams();
    this.dialogService.open(this.addTeamDialog);
  }

  loadAvailableTeams(): void {
    this.hackathonTeamService
      .teamsByEvaluator(this.selectedRound.id, this.currentMentor.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((teams) => {
        const bookedTeamIds = this.selectedSlot?.round_mentor_slot_bookings?.map((b) => b.hackathon_team_id) || [];
        this.availableTeams = teams.filter((team) => !team.slot_assigned && !bookedTeamIds.includes(team.id));
      });
  }

  assignTeam(teamId: number, dialogRef: any): void {
    this.roundMentorSlotBookingService
      .createBooking(teamId, this.selectedSlot.id, this.currentMentor.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastrService.successDialog('Team assigned successfully');
          this.loadMentorSlots();
          dialogRef.close();
        },
        error: () => {
          this.toastrService.errorDialog('Failed to assign team');
        },
      });
  }

  openCancelSlotDialog(slot: IRoundMentorSlot, index: number): void {
    this.selectedSlot = slot;
    this.selectedSlotIndex = index;
    this.dialogService.open(this.cancelSlotDialog);
  }

  cancelSlot(dialogRef: any): void {
    this.roundMentorSlotService
      .updateStatus(this.selectedSlot.id, ERoundMentorSlotStatus.CANCELLED_BY_MENTOR)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastrService.successDialog('Slot cancelled successfully');
          this.loadMentorSlots();
          dialogRef.close();
        },
        error: () => {
          this.toastrService.errorDialog('Failed to cancel slot');
        },
      });
  }
}
