import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import {
  EHackathonRegistrationStatus,
  IHackathon,
  IHackathonTeam,
  IRound,
  EDbModels,
  ERoundType,
} from '@commudle/shared-models';
import { RoundService } from '@commudle/shared-services';
import { Subject, takeUntil } from 'rxjs';
import { PptUploadDialogComponent } from './ppt-upload-dialog/ppt-upload-dialog.component';
import { NbDialogService } from '@commudle/theme';

@Component({
  selector: 'commudle-public-hackathon-registration',
  templateUrl: './public-hackathon-registration.component.html',
  styleUrls: ['./public-hackathon-registration.component.scss'],
})
export class PublicHackathonRegistrationComponent implements OnInit, OnDestroy {
  @Input() hrgId: number; // ID of the hackathon response group
  @Input() userTeamDetails: IHackathonTeam;
  @Input() hackathon: IHackathon;
  EHackathonRegistrationStatus = EHackathonRegistrationStatus;
  currentDate: Date;
  hackathonApplicationEndDate: Date;
  hackathonEndDate: Date;
  canSubmitProject = false;
  canEditForm = false;
  rounds: IRound[] = [];
  ERoundType = ERoundType;
  private destroy$ = new Subject<void>();

  constructor(private roundService: RoundService, private dialogService: NbDialogService) {}

  ngOnInit() {
    this.calculateHackathonDatesStatus();
    this.loadRounds();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRounds() {
    this.roundService
      .pIndexRounds(this.hackathon.id, EDbModels.HACKATHON)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rounds) => {
          this.rounds = rounds;
        },
        error: (error) => {
          console.error('Error loading rounds:', error);
        },
      });
  }

  calculateHackathonDatesStatus() {
    this.currentDate = new Date();
    this.hackathonApplicationEndDate = new Date(this.hackathon.application_end_date);
    this.hackathonEndDate = new Date(this.hackathon.end_date);

    // Add 5 days to hackathonEndDate
    const hackathonEndDatePlusFiveDays = new Date(this.hackathonEndDate);
    hackathonEndDatePlusFiveDays.setDate(this.hackathonEndDate.getDate() + 5);

    if (this.currentDate <= this.hackathonEndDate) {
      this.canSubmitProject = true;
    }
    if (this.currentDate <= hackathonEndDatePlusFiveDays) {
      this.canEditForm = true;
    }
  }

  isRoundCompleted(round: IRound): boolean {
    if (!this.userTeamDetails?.round) {
      if (round.end_date) {
        return new Date(round.end_date) < new Date();
      }
      return false;
    }
    return round.order < this.userTeamDetails.round.order;
  }

  isCurrentRound(round: IRound): boolean {
    if (this.userTeamDetails?.round?.id === round.id) return true;
    if (!this.userTeamDetails?.round && round.date && round.end_date) {
      const now = new Date();
      return new Date(round.date) <= now && now <= new Date(round.end_date);
    }
    return false;
  }

  isUpcomingRound(round: IRound): boolean {
    if (!this.userTeamDetails?.round) {
      if (round.date) {
        return new Date(round.date) > new Date();
      }
      return true;
    }
    return round.order > this.userTeamDetails.round.order;
  }

  handleRoundSubmission(round: IRound) {
    if (round.round_type === ERoundType.PROJECT_SUBMISSION) {
      window.location.href = `/builds/${
        this.userTeamDetails.community_build ? this.userTeamDetails.community_build.slug + '/edit' : 'create'
      }?parent_type=HackathonTeam&parent_id=${this.userTeamDetails.id}`;
    } else if (round.round_type === ERoundType.PPT_SUBMISSION) {
      this.openPPTUploadDialog(round);
    }
  }

  openPPTUploadDialog(round: IRound) {
    this.dialogService.open(PptUploadDialogComponent, {
      context: {
        round: round,
        teamId: this.userTeamDetails.id,
      },
    });
  }
}
