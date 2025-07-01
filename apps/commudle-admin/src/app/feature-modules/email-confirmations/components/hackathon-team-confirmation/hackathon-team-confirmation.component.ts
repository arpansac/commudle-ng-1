import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppUsersService, AuthService, SeoService } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
import { UserConsentsComponent } from 'apps/commudle-admin/src/app/app-shared-components/user-consents/user-consents.component';
import { HackathonUserResponsesService } from 'apps/commudle-admin/src/app/services/hackathon-user-responses.service';
import { IHackathon } from 'apps/shared-models/hackathon.model';
import { ConsentTypesEnum } from 'apps/shared-models/enums/consent-types.enum';
import {
  EInvitationStatus,
  EUserRoles,
  IHackathonTeam,
  IHackathonUserResponse,
  IProfileCompletionStatus,
  IUser,
  IUserStat,
} from '@commudle/shared-models';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { faArrowUpRightFromSquare, faUsers } from '@fortawesome/free-solid-svg-icons';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { UserRolesUsersService } from 'apps/commudle-admin/src/app/services/user_roles_users.service';

@Component({
  selector: 'commudle-hackathon-team-confirmation',
  templateUrl: './hackathon-team-confirmation.component.html',
  styleUrls: ['./hackathon-team-confirmation.component.scss'],
})
export class HackathonTeamConfirmationComponent implements OnInit {
  roleName = 'Hackathon Teammate Invitation';
  showPageDetails = false;
  hackathon: IHackathon;
  hur: IHackathonUserResponse;
  token: string;
  EInvitationStatus = EInvitationStatus;
  isLoading = false;
  currentUser: IUser;
  userProfileDetails: IUserStat;
  isProfileCompleted = false;
  communityLeaders: IUser[];
  faUsers = faUsers;
  faArrowUpRightFromSquare = faArrowUpRightFromSquare;
  private destroy$ = new Subject<void>();
  subscriptions: Subscription[] = [];
  hackathonJudges = [];
  userTeamDetails: IHackathonTeam[];
  interestedUsers: IUser[];
  interestedUsersCount: number;

  constructor(
    private activatedRoute: ActivatedRoute,
    private hurService: HackathonUserResponsesService,
    private seoService: SeoService,
    private nbDialogService: NbDialogService,
    private authService: AuthService,
    private appUsersService: AppUsersService,
    private hackathonService: HackathonService,
    private uruService: UserRolesUsersService,
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.token = params.token;
      this.hurService.verifyInvitationTokenHur(this.token).subscribe((data) => {
        this.hackathon = data.hackathon;
        this.getHackathonCurrentRegistrationDetails();
        this.getJudges();
        this.fetchCommunityDetails();
        console.log(this.hackathon);
        this.hur = data.hackathon_user_response;
        if (this.hur.invite_status === EInvitationStatus.INVITED || Number(params.status) === 1) {
          this.onAcceptRoleButton();
        } else if (Number(params.status) === 2) {
          this.activateRole(this.token, EInvitationStatus.REJECTED);
        } else {
          this.onAcceptRoleButton();
        }
      });
    });
    this.fetchCurrentUserDetails();
    this.seoService.setTitle('Confirm Role');
    this.seoService.noIndex(true);
  }

  private fetchCurrentUserDetails() {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((currentUser: IUser) => {
      this.currentUser = currentUser;
      this.fetchUserStats();
      this.getProfileCompletionStatus();
    });
  }

  private fetchUserStats() {
    this.appUsersService.getProfileStats().subscribe((data) => {
      this.userProfileDetails = data;
    });
  }

  private getProfileCompletionStatus() {
    this.appUsersService.profileCompletionStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe((status: IProfileCompletionStatus) => {
        if (status) {
          this.isProfileCompleted = !status.completed;
        }
      });
  }

  getJudges() {
    this.subscriptions.push(
      this.hackathonService.pIndexJudge(this.hackathon.id).subscribe((data) => {
        this.hackathonJudges = data;
        this.isLoading = false;
      }),
    );
  }

  onAcceptRoleButton() {
    const dialogRef = this.nbDialogService.open(UserConsentsComponent, {
      context: {
        component: ConsentTypesEnum.HACKATHON_TEAMMATE_INVITATION,
        consentType: ConsentTypesEnum.HACKATHON_TEAMMATE_INVITATION,
      },
    });
    dialogRef.componentRef.instance.consentOutput.subscribe((result) => {
      dialogRef.close();
      if (result === 'rejected') {
        this.activateRole(this.token, EInvitationStatus.REJECTED);
      } else {
        this.activateRole(this.token, EInvitationStatus.ACCEPTED);
      }
    });
  }

  activateRole(token, inviteStatus?: EInvitationStatus) {
    this.hurService.updateInvitationTokenHur(token, inviteStatus).subscribe((data) => {
      this.showPageDetails = true;
      if (data) {
        this.hur = data;
      }
    });
  }

  getHackathonCurrentRegistrationDetails() {
    this.subscriptions.push(
      this.hackathonService
        .getHackathonCurrentRegistrationDetails(this.hackathon.id)
        .subscribe((data: IHackathonTeam[]) => {
          if (data) {
            this.userTeamDetails = data;
            this.interestedUsers = this.userTeamDetails[0].hackathon_user_responses.map((response) => response.user);
            this.interestedUsersCount = this.userTeamDetails[0].hackathon_user_responses.length;
            console.log(this.interestedUsers);
            console.log(this.interestedUsersCount);
          }
        }),
    );
  }

  private fetchCommunityDetails() {
    this.uruService.pGetCommunityLeadersByRole(this.hackathon.community.id, EUserRoles.ORGANIZER).subscribe((data) => {
      this.communityLeaders = data.users;
    });
  }
}
