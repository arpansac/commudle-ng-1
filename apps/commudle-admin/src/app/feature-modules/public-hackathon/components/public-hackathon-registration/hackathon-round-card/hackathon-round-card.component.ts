import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import {
  IRound,
  IHackathonTeam,
  EHackathonRegistrationStatus,
  ERoundType,
  IHackathonJudge,
} from '@commudle/shared-models';
import { NbDialogService } from '@commudle/theme';
import { PptUploadDialogComponent } from 'apps/commudle-admin/src/app/feature-modules/public-hackathon/components/public-hackathon-registration/ppt-upload-dialog/ppt-upload-dialog.component';
import * as moment from 'moment';

@Component({
  selector: 'commudle-hackathon-round-card',
  templateUrl: './hackathon-round-card.component.html',
  styleUrls: ['./hackathon-round-card.component.scss'],
})
export class HackathonRoundCardComponent implements OnInit, AfterViewInit {
  @Input() round: IRound;
  @Input() index: number;
  @Input() userTeamDetails: IHackathonTeam;
  @ViewChild('descriptionSpan') descriptionSpan: ElementRef;
  isCompleted: boolean;
  isUpcoming: boolean;
  isLive: boolean;
  isDescriptionExpanded = false;
  isDescriptionTruncated = false;
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
  // TODO: optimize it, try to not use return function which was called from html
  getRoundEvaluators(): IHackathonJudge[] {
    if (!this.userTeamDetails?.hackathon_team_round_scores) return [];
    return this.userTeamDetails.hackathon_team_round_scores
      .filter((score) => score.round_id === this.round.id)
      .map((score) => score.evaluator)
      .filter((evaluator) => evaluator != null);
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

  ngAfterViewInit() {
    this.checkIfTruncated();
  }

  checkIfTruncated() {
    if (this.descriptionSpan) {
      const element = this.descriptionSpan.nativeElement;
      this.isDescriptionTruncated = element.scrollHeight > element.clientHeight;
    }
  }

  toggleDescription() {
    this.isDescriptionExpanded = !this.isDescriptionExpanded;
  }

  openPPTUploadDialog() {
    this.dialogService
      .open(PptUploadDialogComponent, {
        context: {
          round: this.round,
          teamId: this.userTeamDetails.id,
          existingSubmission: this.getRoundSubmission(),
        },
      })
      .onClose.subscribe((updatedSubmission) => {
        if (updatedSubmission) {
          const existingIndex = this.userTeamDetails.hackathon_team_round_submissions.findIndex(
            (s) => s.round.id === this.round.id,
          );
          if (existingIndex !== -1) {
            this.userTeamDetails.hackathon_team_round_submissions[existingIndex] = updatedSubmission;
          } else {
            this.userTeamDetails.hackathon_team_round_submissions.push(updatedSubmission);
          }
        }
      });
  }
}
