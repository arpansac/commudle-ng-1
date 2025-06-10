import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EDbModels, IEvent, IProfileCompletionStatus, IUser } from '@commudle/shared-models';
import { AppUsersService, AuthService, SeoService } from '@commudle/shared-services';
import { DataFormEntitiesService } from 'apps/commudle-admin/src/app/services/data-form-entities.service';
import { EventsService } from 'apps/commudle-admin/src/app/services/events.service';
import { IDataFormEntity } from 'apps/shared-models/data_form_entity.model';
import { Subject, Subscription, takeUntil } from 'rxjs';
import * as moment from 'moment';
@Component({
  selector: 'commudle-fill-data-form-confirmation',
  templateUrl: './fill-data-form-confirmation.component.html',
  styleUrls: ['./fill-data-form-confirmation.component.scss'],
})
export class FillDataFormConfirmationComponent implements OnInit, OnDestroy {
  currentUser: IUser;
  event: IEvent;
  isProfileCompleted = false;

  moment = moment;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private dataFormEntitiesService: DataFormEntitiesService,
    private seoService: SeoService,
    private eventsService: EventsService,
    private appUsersService: AppUsersService,
  ) {}

  ngOnInit() {
    this.fetchCurrentUserDetails();
    this.fetchDataFormEntity();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchCurrentUserDetails() {
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

  fetchDataFormEntity() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.getDataFormEntity(params.data_form_entity_id);
    });
  }

  getDataFormEntity(dataFormEntityId) {
    this.dataFormEntitiesService.getDataFormEntity(dataFormEntityId).subscribe((data: IDataFormEntity) => {
      this.seoService.setTags(
        `${data.name} | Completed`,
        `Fill the form for ${data.name}`,
        'https://commudle.com/assets/images/commudle-logo192.png',
      );
      this.getParent(data);
    });
  }

  //get form entityType
  getParent(dataFormEntity) {
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

  getEvent(dataFormEntity) {
    this.eventsService.pGetEvent(dataFormEntity.redirectable_entity_id).subscribe((data: IEvent) => {
      this.event = data;
    });
  }
}
