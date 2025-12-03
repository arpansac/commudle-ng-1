import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { IRound, IHackathonTeam, EHackathonRegistrationStatus, ERoundType } from '@commudle/shared-models';
import { NbDialogService } from '@commudle/theme';
import { PptUploadDialogComponent } from 'apps/commudle-admin/src/app/feature-modules/public-hackathon/components/public-hackathon-registration/ppt-upload-dialog/ppt-upload-dialog.component';
import * as moment from 'moment';

@Component({
  selector: 'commudle-hackathon-round-card',
  templateUrl: './hackathon-round-card.component.html',
  styleUrls: ['./hackathon-round-card.component.scss'],
})
export class HackathonRoundCardComponent implements OnInit {
  @Input() round: IRound;
  @Input() index: number;
  @Input() userTeamDetails: IHackathonTeam;
  isCompleted: boolean;
  isUpcoming: boolean;
  isLive: boolean;
  moment = moment;

  EHackathonRegistrationStatus = EHackathonRegistrationStatus;
  ERoundType = ERoundType;

  constructor(private dialogService: NbDialogService) {}

  ngOnInit() {
    this.isRoundCompleted();
    this.isUpcomingRound();
    this.isRoundLive();
  }

  getRoundSubmission() {
    return this.userTeamDetails?.hackathon_team_round_submissions?.find(
      (submission) => submission.round.id === this.round.id,
    );
  }

  isRoundCompleted() {
    this.isCompleted = this.round.end_date ? new Date(this.round.end_date) < new Date() : false;
  }

  isUpcomingRound() {
    this.isUpcoming = this.round.date ? new Date(this.round.date) > new Date() : false;
  }

  isRoundLive() {
    if (!this.round.date || !this.round.end_date) {
      this.isLive = false;
      return;
    }
    const now = new Date();
    this.isLive = new Date(this.round.date) <= now && now <= new Date(this.round.end_date);
  }

  openPPTUploadDialog() {
    this.dialogService.open(PptUploadDialogComponent, {
      context: {
        round: this.round,
        teamId: this.userTeamDetails.id,
      },
    });
  }
}
