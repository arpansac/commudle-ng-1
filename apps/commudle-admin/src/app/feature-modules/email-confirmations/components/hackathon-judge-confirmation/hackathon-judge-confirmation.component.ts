import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EUserRoles, IProfileCompletionStatus, IUser, IUserStat } from '@commudle/shared-models';
import { AppUsersService, AuthService, SeoService } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
import { UserConsentsComponent } from 'apps/commudle-admin/src/app/app-shared-components/user-consents/user-consents.component';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { UserRolesUsersService } from 'apps/commudle-admin/src/app/services/user_roles_users.service';
import { ConsentTypesEnum } from 'apps/shared-models/enums/consent-types.enum';
import { IHackathonJudge, EInvitationStatus } from 'apps/shared-models/hackathon-judge.model';
import { IHackathon } from 'apps/shared-models/hackathon.model';
import { Subject, Subscription, takeUntil } from 'rxjs';

@Component({
  selector: 'commudle-hackathon-judge-confirmation',
  templateUrl: './hackathon-judge-confirmation.component.html',
  styleUrls: ['./hackathon-judge-confirmation.component.scss'],
})
export class HackathonJudgeConfirmationComponent implements OnInit {
  token: string;
  hackathon: IHackathon;
  judge: IHackathonJudge;
  EInvitationStatus = EInvitationStatus;
  showPageDetails = false;
  isLoading = true;
  currentUser: IUser;
  userProfileDetails: IUserStat;
  isProfileCompleted = false;
  hackathonJudges = [];
  communityLeaders: IUser[];
  subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private hackathonService: HackathonService,
    private nbDialogService: NbDialogService,
    private router: Router,
    private seoService: SeoService,
    private authService: AuthService,
    private appUsersService: AppUsersService,
    private uruService: UserRolesUsersService,
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.token = params.token;
      this.hackathonService.verifyInvitationTokenJudge(this.token).subscribe((data) => {
        this.hackathon = data.hackathon;
        this.judge = data.judge;
        this.getJudges();
        this.fetchCommunityDetails();
        if (this.judge.invite_status === EInvitationStatus.INVITED || Number(params.status) === 1) {
          this.onAcceptRoleButton();
        }
        if (Number(params.status) === 2) {
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

  private fetchCommunityDetails() {
    this.uruService.pGetCommunityLeadersByRole(this.hackathon.community.id, EUserRoles.ORGANIZER).subscribe((data) => {
      this.communityLeaders = data.users;
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
        component: 'hackathon_judge_invitation',
        consentType: ConsentTypesEnum.HACKATHON_JUDGE_INVITATION,
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
    this.hackathonService.updateInvitationTokenJudge(token, inviteStatus).subscribe((data) => {
      this.showPageDetails = true;
      if (data) {
        this.judge = data;
      }
    });
  }
}
