/* eslint-disable @nx/enforce-module-boundaries */
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  EDbModels,
  EDiscussionType,
  EHackathonRegistrationStatus,
  EInvitationStatus,
  EParticipateTypes,
  ICommunityChannel,
  IHackathonTeam,
  IHackathonUserResponse,
} from '@commudle/shared-models';
import { AuthService, CommunityChannelsService, ToastrService } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
import { faArrowRight, faUserMinus, faXmark, faEdit } from '@fortawesome/free-solid-svg-icons';
import { HackathonResponseGroupService } from 'apps/commudle-admin/src/app/services/hackathon-response-group.service';
import { HackathonUserResponsesService } from 'apps/commudle-admin/src/app/services/hackathon-user-responses.service';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { IHackathon } from 'apps/shared-models/hackathon.model';
import { IHackathonResponseGroup } from 'apps/shared-models/hackathon-response-group.model';
import { Subject, Subscription, takeUntil } from 'rxjs';
@Component({
  selector: 'commudle-public-hackathon-user-dashboard',
  templateUrl: './public-hackathon-user-dashboard.component.html',
  styleUrls: ['./public-hackathon-user-dashboard.component.scss'],
})
export class PublicHackathonUserDashboardComponent implements OnInit, OnDestroy {
  icons = {
    faArrowRight,
    faUserMinus,
    faXmark,
    faEdit,
  };
  EHackathonRegistrationStatus = EHackathonRegistrationStatus;
  hackathon: IHackathon;
  subscriptions: Subscription[] = [];
  userTeamDetails: IHackathonTeam[];
  selectedTeamIndex = 0;
  hrgId: number;
  EDbModels: EDbModels;
  EDiscussionType = EDiscussionType;
  channels: ICommunityChannel[];
  EInvitationStatus = EInvitationStatus;
  hackathonResponseGroup: IHackathonResponseGroup;
  hasTeammateOption = false;
  isSubmittingProblemStatement = false;

  @ViewChild('editTeamMembersDialog') editTeamMembersDialogRef: TemplateRef<any>;
  @ViewChild('problemStatementDialog') problemStatementDialogRef: TemplateRef<any>;
  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private hackathonService: HackathonService,
    private hrgService: HackathonResponseGroupService,
    private authService: AuthService,
    private channelService: CommunityChannelsService,
    private nbDialogService: NbDialogService,
    private hackathonUserResponseService: HackathonUserResponsesService,
    private toasterService: ToastrService,
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.activatedRoute.parent.data.subscribe((data) => {
        this.hackathon = data.hackathon;
        if (this.hackathon.participate_types === EParticipateTypes.TEAM) {
          this.hasTeammateOption = true;
        }
        this.getChannels();
        this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((currentUser) => {
          if (currentUser) this.getHackathonCurrentRegistrationDetails();
        });
      }),
      this.hrgService.showHackathonResponseGroup(this.hackathon.id).subscribe((data) => {
        this.hrgId = data.id;
        this.hackathonResponseGroup = data;
      }),
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getHackathonCurrentRegistrationDetails() {
    this.subscriptions.push(
      this.hackathonService
        .getHackathonCurrentRegistrationDetails(this.hackathon.id)
        .subscribe((data: IHackathonTeam[]) => {
          if (data) {
            this.userTeamDetails = data;
          }
        }),
    );
  }

  getChannels() {
    this.hackathonService.getHackathonUserChannels(this.hackathon.id).subscribe((channels) => {
      this.channels = channels;
    });
  }

  openDialogBox(
    dialog: TemplateRef<any>,
    hur: IHackathonUserResponse,
    team: IHackathonTeam,
    index: number,
    teamIndex: number,
  ) {
    this.nbDialogService.open(dialog, {
      context: {
        hur: hur,
        team: team,
        index: index,
        team_index: teamIndex,
      },
    });
  }

  removeMember(hur: IHackathonUserResponse, team: IHackathonTeam, index: number, teamIndex: number) {
    this.hackathonUserResponseService.removeTeamMember(team.id, hur.id).subscribe((data) => {
      if (data) {
        this.toasterService.successDialog('Team member removed from your team');
        this.userTeamDetails[teamIndex].hackathon_user_responses.splice(index, 1);
      }
    });
  }

  resendInviteToMember(hur: IHackathonUserResponse, team: IHackathonTeam) {
    this.hackathonUserResponseService.resendInviteToTeammate(team.id, hur.id).subscribe((data) => {
      if (data) {
        this.toasterService.successDialog('Team member invite resent');
      }
    });
  }

  openEditTeamMembersDialog() {
    const selectedTeam = this.userTeamDetails[this.selectedTeamIndex];
    const hackathonUserResponse = selectedTeam.hackathon_user_responses[0];
    this.nbDialogService.open(this.editTeamMembersDialogRef, {
      context: {
        hackathonUserResponse: hackathonUserResponse,
        hackathonResponseGroup: this.hackathonResponseGroup,
        selectedTeam: selectedTeam,
      },
    });
  }

  submitTeammateDetails(formData, dialogRef: any, hackathonUserResponseId) {
    dialogRef.close();
    this.hackathonUserResponseService.updateTeamDetails(formData, hackathonUserResponseId).subscribe((data) => {
      if (data) {
        this.toasterService.successDialog('Team members updated successfully');
      }
    });
  }

  shouldShowProblemStatementPrompt(): boolean {
    if (!this.userTeamDetails || this.userTeamDetails.length === 0) return false;
    const team = this.userTeamDetails[this.selectedTeamIndex];
    return team.registration_status === EHackathonRegistrationStatus.ACCEPTED && !team.problem_statement;
  }

  openProblemStatementDialog() {
    const selectedTeam = this.userTeamDetails[this.selectedTeamIndex];
    this.nbDialogService.open(this.problemStatementDialogRef, {
      context: {
        selectedTeam: selectedTeam,
      },
    });
  }

  submitProjectDetails(formData, dialogRef: any) {
    const team = this.userTeamDetails[this.selectedTeamIndex];
    this.hackathonUserResponseService
      .updateProjectDetails(formData, team.hackathon_user_responses[0].id)
      .subscribe((data) => {
        if (data) {
          this.toasterService.successDialog('Problem statement updated successfully');
          dialogRef.close();
          this.getHackathonCurrentRegistrationDetails();
          this.isSubmittingProblemStatement = false;
        }
      });
  }
}
