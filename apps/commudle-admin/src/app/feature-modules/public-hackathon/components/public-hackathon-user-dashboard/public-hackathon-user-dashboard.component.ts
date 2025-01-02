/* eslint-disable @nx/enforce-module-boundaries */
import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  EDbModels,
  EDiscussionType,
  ICommunityChannel,
  IHackathonTeam,
  IHackathonUserResponse,
} from '@commudle/shared-models';
import { AuthService, CommunityChannelsService, ToastrService } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
import { faArrowRight, faUserMinus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { HackathonResponseGroupService } from 'apps/commudle-admin/src/app/services/hackathon-response-group.service';
import { HackathonUserResponsesService } from 'apps/commudle-admin/src/app/services/hackathon-user-responses.service';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { IHackathon } from 'apps/shared-models/hackathon.model';
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
  };
  hackathon: IHackathon;
  subscriptions: Subscription[] = [];
  userTeamDetails: IHackathonTeam[];
  hrgId: number;
  EDbModels: EDbModels;
  EDiscussionType = EDiscussionType;
  channels: ICommunityChannel[];

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
        this.getChannels();
        this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((currentUser) => {
          if (currentUser) this.getHackathonCurrentRegistrationDetails();
        });
      }),
      this.hrgService.showHackathonResponseGroup(this.hackathon.id).subscribe((data) => {
        this.hrgId = data.id;
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
}
