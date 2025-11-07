import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IPageInfo, IProfileCompletionStatus, IUser, IUserStat } from '@commudle/shared-models';
import { AppUsersService, AuthService } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { UserConsentsComponent } from 'apps/commudle-admin/src/app/app-shared-components/user-consents/user-consents.component';
import { CommunityGroupsService } from 'apps/commudle-admin/src/app/services/community-groups.service';
import { DataFormEntityResponseGroupsService } from 'apps/commudle-admin/src/app/services/data-form-entity-response-groups.service';
import { UserRolesUsersService } from 'apps/commudle-admin/src/app/services/user_roles_users.service';
import { ICommunityGroup } from 'apps/shared-models/community-group.model';
import { ICommunity } from 'apps/shared-models/community.model';
import { IDataFormEntityResponseGroup } from 'apps/shared-models/data_form_entity_response_group.model';
import { ConsentTypesEnum } from 'apps/shared-models/enums/consent-types.enum';
import { EUserRoles } from 'apps/shared-models/enums/user_roles.enum';
import { IEvent } from 'apps/shared-models/event.model';
import { IUserRolesUser } from 'apps/shared-models/user_roles_user.model';
import { SeoService } from 'apps/shared-services/seo.service';
import { Subject, Subscription, takeUntil } from 'rxjs';

@Component({
  selector: 'app-user-role-confirmation',
  templateUrl: './user-role-confirmation.component.html',
  styleUrls: ['./user-role-confirmation.component.scss'],
})
export class UserRoleConfirmationComponent implements OnInit, OnDestroy {
  userRolesUser: IUserRolesUser;
  community: ICommunity;
  event: IEvent;
  communityGroup: ICommunityGroup;
  EUserRoles = EUserRoles;
  acceptRole = false;
  token;
  role;
  parentName;
  communityName;
  eventName;
  subscriptions: Subscription[] = [];
  roleRejected: boolean;
  communityLeaders: IUser[];
  isLoading = false;
  faArrowUpRightFromSquare = faArrowUpRightFromSquare;
  currentUser: IUser;
  userProfileDetails: IUserStat;
  isProfileCompleted = false;
  limit = 20;
  IPageInfoTeam: IPageInfo;
  IPageInfoSpeaker: IPageInfo;
  leadersOrg: IUser[] = [];
  speakers: IDataFormEntityResponseGroup[] = [];
  private destroy$ = new Subject<void>();
  isLoadingSpeakers = true;
  isLoadingCommunityLeaders = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private userRolesUsersService: UserRolesUsersService,
    private seoService: SeoService,
    private nbDialogService: NbDialogService,
    private router: Router,
    private uruService: UserRolesUsersService,
    private authService: AuthService,
    private appUsersService: AppUsersService,
    private communityGroupsService: CommunityGroupsService,
    private dataFormEntityResponseGroupsService: DataFormEntityResponseGroupsService,
  ) {}
  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.token = params.token;
      this.userRolesUsersService.verifyInvitationToken(this.token).subscribe((data) => {
        this.role = data.user_roles_user.user_role.name;
        this.parentName = data.user_roles_user.parent_name;
        this.communityName = data.community?.name;
        this.eventName = data.event?.name;
        this.onAcceptRoleButton();
      });
    });

    this.seoService.setTitle('Confirm Role');
    this.seoService.noIndex(true);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
    this.seoService.noIndex(false);
  }

  private fetchCommunityDetails() {
    this.isLoadingCommunityLeaders = true;
    this.uruService.pGetCommunityLeadersByRole(this.community.id, EUserRoles.ORGANIZER).subscribe((data) => {
      this.communityLeaders = data.users;
      this.isLoadingCommunityLeaders = false;
    });
  }

  private getCommunityOrgsTeam() {
    this.isLoading = true;
    this.subscriptions.push(
      this.communityGroupsService
        .pGetOrganizersAllCommunities(this.communityGroup.slug, this.limit, this.IPageInfoTeam?.end_cursor)
        .subscribe((data) => {
          if (data) {
            this.leadersOrg = this.leadersOrg.concat(data.page.reduce((acc, value) => [...acc, value.data], []));
            this.IPageInfoTeam = data.page_info;
            this.isLoading = false;
          }
        }),
    );
  }

  private fetchCurrentUserDetails() {
    this.isLoading = true;
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((currentUser: IUser) => {
      this.currentUser = currentUser;
      this.isLoading = false;
      this.fetchUserStats();
      this.getProfileCompletionStatus();
    });
  }

  getEventSpeakers() {
    this.isLoadingSpeakers = true;
    this.dataFormEntityResponseGroupsService.pGetEventSpeakers(this.event.id).subscribe((data) => {
      this.speakers = data.data_form_entity_response_groups;
      this.isLoadingSpeakers = false;
    });
  }

  private fetchUserStats() {
    this.isLoading = true;
    this.appUsersService.getProfileStats().subscribe((data) => {
      if (data) {
        this.userProfileDetails = data;
        this.isLoading = false;
      }
    });
  }

  private getProfileCompletionStatus() {
    this.isLoading = true;
    this.appUsersService.profileCompletionStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe((status: IProfileCompletionStatus) => {
        if (status) {
          this.isProfileCompleted = !status.completed;
        }
        this.isLoading = false;
      });
  }

  activateRole(token, decline?: boolean) {
    this.userRolesUsersService.confirmCommunityRole(token, decline).subscribe((data) => {
      this.userRolesUser = data.user_roles_user;
      this.community = data.community;
      this.event = data.event;
      this.communityGroup = data.community_group;
      if (this.community) {
        this.fetchCommunityDetails();
      }
      if (this.event) {
        this.getEventSpeakers();
      }
      if (this.communityGroup) {
        this.getCommunityOrgsTeam();
      }
      this.fetchCurrentUserDetails();
    });
  }

  onAcceptRoleButton() {
    if (this.acceptRole) {
      return;
    }
    this.acceptRole = true;
    const dialogRef = this.nbDialogService.open(UserConsentsComponent, {
      context: {
        component: this.role,
        parentName: this.parentName,
        consentType: ConsentTypesEnum.AcceptRole,
        volunteerCommunityName: this.communityName,
        volunteerEventName: this.eventName,
      },
    });
    dialogRef.componentRef.instance.consentOutput.subscribe((result) => {
      dialogRef.close();
      if (result === 'rejected') {
        const queryParams = { token: this.token, decline: true };
        this.router.navigate([], { queryParams });
        this.activateRole(this.token, true);
        this.roleRejected = true;
      } else {
        this.activateRole(this.token);
      }
    });
  }
}
