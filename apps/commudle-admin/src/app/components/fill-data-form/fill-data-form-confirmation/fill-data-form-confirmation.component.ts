import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EDbModels, IEvent, IPageInfo, IProfileCompletionStatus, IUser } from '@commudle/shared-models';
import { AppUsersService, AuthService, SeoService } from '@commudle/shared-services';
import { DataFormEntitiesService } from 'apps/commudle-admin/src/app/services/data-form-entities.service';
import { EventsService } from 'apps/commudle-admin/src/app/services/events.service';
import { IDataFormEntity } from 'apps/shared-models/data_form_entity.model';
import { Subject, takeUntil } from 'rxjs';
import * as moment from 'moment';
import { IDataFormEntityResponseGroup } from 'apps/shared-models/data_form_entity_response_group.model';
import { DataFormEntityResponseGroupsService } from 'apps/commudle-admin/src/app/services/data-form-entity-response-groups.service';
import { DataFormEntityResponsesService } from 'apps/commudle-admin/src/app/services/data-form-entity-responses.service';
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
  private destroy$ = new Subject<void>();

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

  private fetchQueryParams() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params && params['eto_uuid']) {
        this.etoUuid = params['eto_uuid'];
      }
    });
  }

  private fetchCurrentUserDetails() {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((currentUser: IUser) => {
      this.currentUser = currentUser;
      this.getProfileCompletionStatus();
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

  private fetchDataFormEntity() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.getDataFormEntity(params.data_form_entity_id);
    });
  }

  private getDataFormEntity(dataFormEntityId) {
    this.dataFormEntitiesService.getDataFormEntity(dataFormEntityId).subscribe((data: IDataFormEntity) => {
      this.dataFormEntity = data;
      this.getExistingResponses();
      this.formIsPaid =
        this.dataFormEntity.event_data_form_entity_group.is_paid &&
        !this.dataFormEntity.event_data_form_entity_group.approval_based_payments;
      this.getParent(data);
      this.seoTags(data);
      this.isLoading = false;
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
    this.seoService.setTags(
      `${data.name} | Completed`,
      `Fill the form for ${data.name}`,
      'https://commudle.com/assets/images/commudle-logo192.png',
    );
  }

  //get form entityType
  private getParent(dataFormEntity) {
    switch (dataFormEntity.redirectable_entity_type) {
      case EDbModels.EVENT:
        this.getEvent(dataFormEntity);
        break;
      case 'AdminSurvey':
        // this.showProfileForm = false;
        // nothing need to be done here
        break;
      case 'Survey':
        // this.showProfileForm = false;
        // nothing need to be done here
        break;
      default:
      // this.errorHandler.handleError(404, 'You cannot fill this form');
    }
  }

  private getEvent(dataFormEntity) {
    this.eventsService.pGetEvent(dataFormEntity.redirectable_entity_id).subscribe((data: IEvent) => {
      this.event = data;
      this.getSpeakers();
      this.getVolunteers();
    });
  }

  private getSpeakers() {
    this.dataFormEntityResponseGroupsService.pGetEventSpeakers(this.event.id).subscribe((data) => {
      this.speakers = data.data_form_entity_response_groups;
    });
  }

  private getVolunteers() {
    this.eventsService.pGetEventVolunteers(this.event.slug, this.count, this.pageInfo?.end_cursor).subscribe((data) => {
      this.volunteers = this.volunteers.concat(data.page.reduce((acc, value) => [...acc, value.data], []));
      this.pageInfo = data.page_info;
    });
  }
}
