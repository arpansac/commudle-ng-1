import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  EDbModels,
  EUserRoles,
  ICommunity,
  IEvent,
  IPageInfo,
  IProfileCompletionStatus,
  IUser,
  IUserRolesUser,
  IUserStat,
} from '@commudle/shared-models';
import { AppUsersService, AuthService, SeoService } from '@commudle/shared-services';
import { DataFormEntitiesService } from 'apps/commudle-admin/src/app/services/data-form-entities.service';
import { EventsService } from 'apps/commudle-admin/src/app/services/events.service';
import { IDataFormEntity } from 'apps/shared-models/data_form_entity.model';
import { Subject, takeUntil } from 'rxjs';
import * as moment from 'moment';
import { IDataFormEntityResponseGroup } from 'apps/shared-models/data_form_entity_response_group.model';
import { DataFormEntityResponseGroupsService } from 'apps/commudle-admin/src/app/services/data-form-entity-response-groups.service';
import { DataFormEntityResponsesService } from 'apps/commudle-admin/src/app/services/data-form-entity-responses.service';
import { UserRolesUsersService } from 'apps/commudle-admin/src/app/services/user_roles_users.service';
import { CommunityGroupsService } from 'apps/commudle-admin/src/app/services/community-groups.service';

@Component({
  selector: 'commudle-fill-data-form-confirmation',
  templateUrl: './fill-data-form-confirmation.component.html',
  styleUrls: ['./fill-data-form-confirmation.component.scss'],
})
export class FillDataFormConfirmationComponent implements OnInit, OnDestroy {
  currentUser: IUser;
  event: IEvent;
  isProfileCompleted = false;
  volunteers: IUser[] = [];

  dataFormEntity: IDataFormEntity;
  moment = moment;
  pageInfo: IPageInfo;
  count = 10;
  speakers: IDataFormEntityResponseGroup[] = [];
  formIsPaid = false;
  isLoading = true;
  isFormFilled = true;
  etoUuid: string;
  approvalBased = false;
  communityLeaders: IUser[];
  communities: ICommunity[] = [];
  communityGroupLeaders: IUserRolesUser[] = [];
  userProfileDetails: IUserStat;
  readonly EDbModels = EDbModels;
  private destroy$ = new Subject<void>();
  isLoadingSpeakers = false;
  isLoadingVolunteers = false;
  isLoadingCommunityLeaders = false;
  isLoadingCommunityGroupLeaders = false;
  isLoadingCommunities = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private dataFormEntitiesService: DataFormEntitiesService,
    private seoService: SeoService,
    private eventsService: EventsService,
    private appUsersService: AppUsersService,
    private dataFormEntityResponseGroupsService: DataFormEntityResponseGroupsService,
    private dataFormEntityResponsesService: DataFormEntityResponsesService,
    private router: Router,
    private uruService: UserRolesUsersService,
    private communityGroupService: CommunityGroupsService,
    private AppUsersService: AppUsersService,
  ) {}

  ngOnInit() {
    this.fetchCurrentUserDetails();
    this.fetchDataFormEntity();
    this.fetchQueryParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  private fetchDataFormEntity() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.getDataFormEntity(params.data_form_entity_id);
    });
  }

  private fetchQueryParams() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params && params['eto_uuid']) {
        this.etoUuid = params['eto_uuid'];
      }
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

  private getDataFormEntity(dataFormEntityId) {
    this.dataFormEntitiesService.getDataFormEntity(dataFormEntityId).subscribe((data: IDataFormEntity) => {
      this.dataFormEntity = data;
      this.getExistingResponses();
      this.getParent(data);
      this.seoTags(data);
    });
  }

  private getExistingResponses() {
    this.dataFormEntityResponsesService.getExistingResponse(this.dataFormEntity.id).subscribe((data) => {
      this.isFormFilled = data.data_form_entity_response_group?.id ? true : false;
      if (!this.isFormFilled) {
        this.router.navigate(['/fill-form', this.dataFormEntity.id]);
      }
    });
  }

  private seoTags(data) {
    let title = `Submitted | ${data?.name}`;
    if (this.event && this.event.kommunity) {
      title = `Submitted |  ${this.event.name} | ${this.event.kommunity.name} | ${data.name}`;
    }
    this.seoService.setTitle(title);
  }

  //get form entityType
  private getParent(dataFormEntity) {
    switch (dataFormEntity.redirectable_entity_type) {
      case EDbModels.EVENT:
        this.getEvent(dataFormEntity);
        break;
      case EDbModels.ADMIN_SURVEY:
        this.isLoading = false;
        break;
      case EDbModels.SURVEY:
        if (this.dataFormEntity.community) {
          this.fetchCommunityDetails();
        }
        if (this.dataFormEntity.community_group) {
          this.fetchCommunityGroupDetails();
        }
        break;
    }
  }

  private getEvent(dataFormEntity) {
    this.eventsService.pGetEvent(dataFormEntity.redirectable_entity_id).subscribe((data: IEvent) => {
      this.event = data;
      this.formIsPaid = this.dataFormEntity.event_data_form_entity_group.is_paid;
      this.approvalBased = this.dataFormEntity.event_data_form_entity_group.approval_based_payments;
      this.getSpeakers();
      this.getVolunteers();
      this.seoTags(this.dataFormEntity);
      this.isLoading = false;
    });
  }

  private getSpeakers() {
    this.isLoadingSpeakers = true;
    this.dataFormEntityResponseGroupsService.pGetEventSpeakers(this.event.id).subscribe((data) => {
      this.speakers = data.data_form_entity_response_groups;
      this.isLoadingSpeakers = false;
      this.isLoading = false;
    });
  }

  private getVolunteers() {
    this.isLoadingVolunteers = true;
    this.eventsService.pGetEventVolunteers(this.event.slug, this.count, this.pageInfo?.end_cursor).subscribe((data) => {
      this.volunteers = this.volunteers.concat(data.page.reduce((acc, value) => [...acc, value.data], []));
      this.pageInfo = data.page_info;
      this.isLoadingVolunteers = false;
      this.isLoading = false;
    });
  }

  private fetchCommunityDetails() {
    this.isLoadingCommunityLeaders = true;
    this.uruService
      .pGetCommunityLeadersByRole(this.dataFormEntity.community.id, EUserRoles.ORGANIZER)
      .subscribe((data) => {
        this.communityLeaders = data.users;
        this.isLoadingCommunityLeaders = false;
        this.isLoading = false;
      });
  }

  private fetchCommunityGroupDetails() {
    this.isLoadingCommunityGroupLeaders = true;
    this.isLoadingCommunities = true;
    this.communityGroupService.pCommunities(this.dataFormEntity.community_group.id, 10).subscribe((data) => {
      this.communities = this.communities.concat(data.page.reduce((acc, value) => [...acc, value.data], []));
      this.isLoadingCommunities = false;
      this.isLoading = false;
    });
    this.uruService.pGetCommunityGroupLeaders(this.dataFormEntity.community_group.id).subscribe((data) => {
      this.communityGroupLeaders = data.user_roles_users;
      this.isLoadingCommunityGroupLeaders = false;
      this.isLoading = false;
    });
  }
}
