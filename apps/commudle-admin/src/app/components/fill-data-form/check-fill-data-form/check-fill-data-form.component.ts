/* eslint-disable @nx/enforce-module-boundaries */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataFormEntitiesService } from 'apps/commudle-admin/src/app/services/data-form-entities.service';
import { IDataFormEntity } from 'apps/shared-models/data_form_entity.model';
import { Subject, Subscription, interval, takeUntil } from 'rxjs';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { NbDialogRef, NbDialogService } from '@commudle/theme';
import { DataFormEntityResponsesService } from 'apps/commudle-admin/src/app/services/data-form-entity-responses.service';
import { ERegistrationStatuses } from 'apps/shared-models/enums/registration_statuses.enum';
import { EDbModels, IUser } from '@commudle/shared-models';
import { LibAuthwatchService } from 'apps/shared-services/lib-authwatch.service';
import { LoginAuthService } from 'apps/shared-services/login-auth.service';
@Component({
  selector: 'commudle-check-fill-data-form',
  templateUrl: './check-fill-data-form.component.html',
  styleUrls: ['./check-fill-data-form.component.scss'],
})
export class CheckFillDataFormComponent implements OnInit, OnDestroy {
  dataFormEntity: IDataFormEntity;
  subscriptions: Subscription[] = [];
  formClosed = false;
  intervalSubscription: Subscription;
  faTriangleExclamation = faTriangleExclamation;
  event_slug: string;
  kommunity_slug: string;
  openPaidForm: boolean;
  existingResponses;
  dialogRef: NbDialogRef<any>;
  currentUser: IUser;
  userLogin: boolean;
  loading = true;

  private destroy$ = new Subject<void>();

  @ViewChild('formClosedDialog', { static: true }) formClosedDialog: TemplateRef<any>;
  @ViewChild('alreadyExistDfe', { static: true }) alreadyExistDfe: TemplateRef<any>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dataFormEntitiesService: DataFormEntitiesService,
    private dialogService: NbDialogService,
    private router: Router,
    private dataFormEntityResponsesService: DataFormEntityResponsesService,
    private authWatchService: LibAuthwatchService,
    private loginAuthService: LoginAuthService,
  ) {}

  ngOnInit() {
    this.authWatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((currentUser: IUser) => {
      this.currentUser = currentUser;
      this.userLogin = this.currentUser ? true : false;
      this.getDataFormEntity();
    });
    this.checkLoginPop();
  }

  checkLoginPop() {
    setTimeout(() => {
      if (this.userLogin === false) {
        this.loginAuthService.openLoginSignupTemplate();
      }
    }, 500);
  }

  getDataFormEntity() {
    this.subscriptions.push(
      this.activatedRoute.params.subscribe((params) => {
        this.dataFormEntitiesService.getDataFormEntity(params.data_form_entity_id).subscribe((data) => {
          this.dataFormEntity = data;
          if (this.currentUser) {
            this.getExistingResponses();
          }
          this.formClosed = !this.dataFormEntity.user_can_fill_form;
          if (this.dataFormEntity.entity_type === EDbModels.EVENT_DATA_FORM_ENTITY_GROUP && this.currentUser) {
            if (
              this.dataFormEntity.form_type.form_type_name === 'attendee' ||
              this.dataFormEntity.form_type.form_type_name === 'speaker'
            ) {
              this.checkAlreadyFilledEntryPassForm(params.data_form_entity_id);
            }
          }
          if (!this.formClosed && this.currentUser) {
            this.checkFormStatus(params.data_form_entity_id);
          }
        });
      }),
    );
  }

  checkFormStatus(dataFormId) {
    this.intervalSubscription = interval(2000).subscribe(() => {
      this.dataFormEntitiesService.checkFormStatus(dataFormId).subscribe((data) => {
        if (!data.form_open) {
          this.clearInterval();
          this.dialogRef = this.dialogService.open(this.formClosedDialog, {
            closeOnBackdropClick: false,
            closeOnEsc: false,
            hasScroll: false,
          });
        }
      });
    });
  }

  getExistingResponses() {
    this.loading = true;
    this.dataFormEntityResponsesService.getExistingResponse(this.dataFormEntity.id).subscribe((data) => {
      this.existingResponses = data;
      if (this.dataFormEntity.entity_type === EDbModels.EVENT_DATA_FORM_ENTITY_GROUP) {
        this.checkPaidFormStatus(data);
      } else {
        this.openPaidForm = false;
      }
      this.loading = false;
    });
  }

  checkPaidFormStatus(existingResponses) {
    if (
      this.dataFormEntity.event_data_form_entity_group.is_paid &&
      !this.dataFormEntity.event_data_form_entity_group.approval_based_payments
    ) {
      this.openPaidForm = true;
    } else if (
      this.dataFormEntity.event_data_form_entity_group.is_paid &&
      this.dataFormEntity.event_data_form_entity_group.approval_based_payments
    ) {
      if (
        existingResponses.data_form_entity_response_group.registration_status?.name ===
          ERegistrationStatuses.SHORTLISTED ||
        existingResponses.data_form_entity_response_group.registration_status?.name === ERegistrationStatuses.CONFIRMED
      ) {
        this.openPaidForm = true;
      } else {
        this.openPaidForm = false;
      }
    } else {
      this.openPaidForm = false;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.clearInterval();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  clearInterval() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  checkAlreadyFilledEntryPassForm(dataFormId) {
    this.subscriptions.push(
      this.dataFormEntitiesService.checkAlreadyFilledEntryPassForm(dataFormId).subscribe((data) => {
        this.event_slug = data.event.slug;
        this.kommunity_slug = data.event.kommunity_slug;
        if (data.filled_another_form) {
          this.dialogService.open(this.alreadyExistDfe, { context: data });
        }
      }),
    );
  }

  redirectToEvent() {
    this.router.navigate(['communities', this.kommunity_slug, 'events', this.event_slug]);
  }
}
