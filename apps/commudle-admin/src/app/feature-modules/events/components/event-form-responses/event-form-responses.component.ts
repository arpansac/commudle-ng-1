/* eslint-disable @nx/enforce-module-boundaries */
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ColumnMode, SortType } from '@commudle/ngx-datatable';
import { NbDialogService, NbWindowService } from '@commudle/theme';
import { EmailerComponent } from 'apps/commudle-admin/src/app/app-shared-components/emailer/emailer.component';
import { AppUsersService } from 'apps/commudle-admin/src/app/services/app-users.service';
import { DataFormEntityResponseGroupsService } from 'apps/commudle-admin/src/app/services/data-form-entity-response-groups.service';
import { DataFormsService } from 'apps/commudle-admin/src/app/services/data_forms.service';
import { EventDataFormEntityGroupsService } from 'apps/commudle-admin/src/app/services/event-data-form-entity-groups.service';
import { RegistrationStatusesService } from 'apps/commudle-admin/src/app/services/registration-statuses.service';
import { ICommunity } from 'apps/shared-models/community.model';
import { IDataForm } from 'apps/shared-models/data_form.model';
import { EemailTypes } from 'apps/shared-models/enums/email_types.enum';
import { EUserRoles } from 'apps/shared-models/enums/user_roles.enum';
import { IEventLocationTrack } from 'apps/shared-models/event-location-track.model';
import { IEvent } from 'apps/shared-models/event.model';
import { IEventDataFormEntityGroup } from 'apps/shared-models/event_data_form_enity_group.model';
import { IQuestion } from 'apps/shared-models/question.model';
import { IRegistrationStatus } from 'apps/shared-models/registration_status.model';
import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';
import { debounceTime, switchMap } from 'rxjs/operators';
import { faXmark, faFilter, faPieChart } from '@fortawesome/free-solid-svg-icons';
import { EQuestionTypes } from 'apps/shared-models/enums/question_types.enum';
import { RegistrationTypeNames } from 'apps/shared-models/registration_type.model';
import { EventLocationsService } from 'apps/commudle-admin/src/app/services/event-locations.service';
import { IEventLocation } from 'apps/shared-models/event-location.model';

@Component({
  selector: 'app-event-form-responses',
  templateUrl: './event-form-responses.component.html',
  styleUrls: ['./event-form-responses.component.scss'],
})
export class EventFormResponsesComponent implements OnInit {
  @ViewChild('table') table;
  @ViewChild('confirmStatusChange', { read: TemplateRef }) confirmStatusChange: TemplateRef<HTMLElement>;

  event: IEvent;
  community: ICommunity;
  eventDataFormEntityGroupId;
  eventDataFormEntityGroup: IEventDataFormEntityGroup;
  registrationStatuses: IRegistrationStatus[] = [];
  dataForm: IDataForm;
  questions: IQuestion[] = [];
  bulkStatus;
  bulkStatusChangeForCanceled = false;
  windowRef;

  isLoading = true;
  rows = [];
  ColumnMode = ColumnMode;
  SortType = SortType;
  emptyMessage;

  page = 1;
  totalEntries: number;
  count = 10;
  filterValue = '';
  registrationStatusId = 0;

  searchForm;

  showFullAnswer = false;

  userRoles = [];
  EUserRoles = EUserRoles;
  fromRegistrationStatus: string;
  toRegistrationStatus: string;
  selectedRegistrationStatus = 0;
  gender = '';
  eventLocationTracks: IEventLocationTrack[] = [];
  selectedEventLocationTrackId = 0;
  icons = {
    faXmark,
    faFilter,
    faPieChart,
  };
  editMode = false;

  forms: FormGroup[] = [];
  EQuestionTypes = EQuestionTypes;
  RegistrationTypeNames = RegistrationTypeNames;
  eventLocations: IEventLocation[];
  dialogRef: any;
  userEngagementFilter: FormGroup;
  community_engagement_filters: Record<string, any> = {};
  attendedEventList: IEvent[];
  //TODO past event stats
  constructor(
    private eventDataFormEntityGroupsService: EventDataFormEntityGroupsService,
    private registrationStatusesService: RegistrationStatusesService,
    private dataFormsService: DataFormsService,
    private activatedRoute: ActivatedRoute,
    private dataFormEntityResponseGroupsService: DataFormEntityResponseGroupsService,
    private windowService: NbWindowService,
    private fb: FormBuilder,
    private toastLogService: LibToastLogService,
    private appUsersService: AppUsersService,
    private eventLocationsService: EventLocationsService,
    private dialogService: NbDialogService,
  ) {
    this.searchForm = this.fb.group({
      name: [''],
    });
    this.userEngagementFilter = this.fb.group({
      show_total_channel_messages: [''],
      min_total_channel_messages: [''],
      max_total_channel_messages: [''],
      show_total_event_registrations: [''],
      min_total_event_registrations: [''],
      max_total_event_registrations: [''],
      show_total_event_speaker_registrations: [''],
      min_total_event_speaker_registrations: [''],
      max_total_event_speaker_registrations: [''],
      show_total_event_speaker_sessions: [''],
      min_total_event_speaker_sessions: [''],
      max_total_event_speaker_sessions: [''],
      show_total_hackathon_registrations: [''],
      min_total_hackathon_registrations: [''],
      max_total_hackathon_registrations: [''],
      show_total_invited_attended_events: [''],
      min_total_invited_attended_events: [''],
      max_total_invited_attended_events: [''],
      show_total_skipped_events: [''],
      min_total_skipped_events: [''],
      max_total_skipped_events: [''],
      show_total_uninvited_attended_events: [''],
      min_total_uninvited_attended_events: [''],
      max_total_uninvited_attended_events: [''],
      show_total_volunteered_events: [''],
      min_total_volunteered_events: [''],
      max_total_volunteered_events: [''],
      show_attended_events: [''],
      attended_events_attendance: [''],
      attended_events_slugs: [],
    });
  }

  ngOnInit() {
    this.activatedRoute.parent.data.subscribe((data) => {
      this.event = data.event;
      this.community = data.community;
      this.getUserRoles();
    });

    this.eventDataFormEntityGroupId = this.activatedRoute.snapshot.queryParamMap['params']['parent_id'];

    this.getEventDataFromEntityGroup(true);

    // get all registration statuses
    this.registrationStatusesService.getRegistrationStatuses().subscribe((data) => {
      this.registrationStatuses = data.registration_statuses;
    });

    // get the dataform associated
    this.dataFormsService
      .getDataFormDetails(this.activatedRoute.snapshot.queryParamMap['params']['data_form_id'])
      .subscribe((data) => {
        this.dataForm = data;
        this.questions = this.dataForm.questions;
      });

    // this.getResponses();
    this.updateFilter();
  }

  // get event_data_form_entity_group
  getEventDataFromEntityGroup(fetchEventLocationTrack?) {
    this.eventDataFormEntityGroupsService
      .getEventDataFormEntityGroup(this.eventDataFormEntityGroupId)
      .subscribe((data) => {
        this.eventDataFormEntityGroup = data;
        if (
          this.eventDataFormEntityGroup.registration_type.name === RegistrationTypeNames.SPEAKER &&
          fetchEventLocationTrack
        ) {
          this.getEventLocationTracks();
        }
      });
  }

  clearInput() {
    this.searchForm.get('name').setValue('');
  }
  getUserRoles() {
    this.appUsersService.getMyRoles('Kommunity', this.community.id).subscribe((res) => {
      this.userRoles = res;
    });
  }

  updateFilter() {
    this.searchForm.valueChanges
      .pipe(
        debounceTime(800),
        switchMap(() => {
          this.rows = [];
          this.page = 1;
          this.emptyMessage = 'Loading...';

          return this.dataFormEntityResponseGroupsService.getEventDataFormResponses(
            this.eventDataFormEntityGroupId,
            this.searchForm.get('name').value.toLowerCase(),
            this.registrationStatusId,
            this.page,
            this.count,
            this.gender,
            this.selectedEventLocationTrackId,
            this.getFormData(),
            Object.keys(this.community_engagement_filters).length === 0 ? null : this.community_engagement_filters,
          );
        }),
      )
      .subscribe((data) => {
        this.setResponses(data);
      });
  }

  clearAllFilter() {
    this.emptyMessage = 'Loading...';
    this.forms = [];
    this.searchForm.get('name').setValue('');
    for (const question of this.questions) {
      if (question.editMode === true) question.editMode = false;
    }
    this.gender = '';
    this.registrationStatusId = 0;
    this.selectedEventLocationTrackId = 0;
  }

  registrationStatusFilter(event) {
    this.page = 1;
    this.registrationStatusId = event.target.value;
    this.getResponses();
  }

  genderFilter(event) {
    this.page = 1;
    this.gender = event ? event.target.value : '';
    this.getResponses();
  }

  getEventLocationTracks() {
    this.eventLocationsService.getEventLocations(this.event.slug).subscribe((data) => {
      this.eventLocations = data.event_locations;
      if (data.event_locations) {
        for (const eventLocation of data.event_locations) {
          for (const eventLocationTrack of eventLocation.event_location_tracks) {
            this.eventLocationTracks.push(eventLocationTrack);
          }
        }
      }
    });
  }

  trackSlotFilter(data?) {
    this.selectedEventLocationTrackId;
    if (data === 0) {
      this.selectedEventLocationTrackId = data;
    }
    this.page = 1;
    this.getResponses();
  }

  setPage(pageNumber) {
    this.page = pageNumber + 1;
    if (this.searchForm.get('name').value) {
      this.emptyMessage = 'Loading...';
      this.dataFormEntityResponseGroupsService
        .getEventDataFormResponses(
          this.eventDataFormEntityGroupId,
          this.searchForm.get('name').value.toLowerCase(),
          this.registrationStatusId,
          this.page,
          this.count,
          this.gender,
          this.selectedEventLocationTrackId,
          this.getFormData(),
          Object.keys(this.community_engagement_filters).length === 0 ? null : this.community_engagement_filters,
        )
        .subscribe((data) => {
          this.setResponses(data);
        });
    } else {
      this.getResponses();
    }
  }

  getResponses() {
    this.emptyMessage = 'Loading...';
    this.isLoading = false;
    this.rows = [];

    this.dataFormEntityResponseGroupsService
      .getEventDataFormResponses(
        this.eventDataFormEntityGroupId,
        this.searchForm.get('name').value.toLowerCase(),
        this.registrationStatusId,
        this.page,
        this.count,
        this.gender,
        this.selectedEventLocationTrackId,
        this.getFormData(),
        Object.keys(this.community_engagement_filters).length === 0 ? null : this.community_engagement_filters,
      )
      .subscribe((data) => {
        this.totalEntries = data.total;
        this.rows = data.data_form_entity_response_groups;
        this.isLoading = false;
        this.emptyMessage = 'No data to display';
      });
  }

  setResponses(data) {
    this.getEventDataFromEntityGroup();
    this.totalEntries = data.total;
    this.rows = data.data_form_entity_response_groups;
    this.isLoading = false;
    this.emptyMessage = 'No entries found';
  }

  getQuestionResponse(userResponses, questionId) {
    const userQuestionResponses = userResponses.filter((k) => k.question_id === questionId);
    let responses = '';
    for (const resp of userQuestionResponses) {
      responses += `${resp.response_text} \n`;
    }

    return userQuestionResponses.length === 0 ? '..' : responses;
  }

  updateRegistrationStatus(registrationStatus, userResponseId) {
    this.rows.find((k) => k.id === userResponseId).registration_status = registrationStatus;
  }

  updateEntryPass(entryPass, userResponseId) {
    this.rows.find((k) => k.id === userResponseId).entry_pass = entryPass;
  }

  toggleExpandRow(row) {
    this.table.rowDetail.toggleExpandRow(row);
  }

  onDetailToggle(event) {}

  openRSVPEmailWindow() {
    this.windowService.open(EmailerComponent, {
      title: `Send RSVP To All Shortlisted`,
      context: {
        community: this.community,
        event: this.event,
        eventDataFormEntityGroupId: this.eventDataFormEntityGroup.id,
        mailType: EemailTypes.RSVP,
      },
    });
  }

  openEntryPassEmailWindow() {
    this.windowService.open(EmailerComponent, {
      title: `Send Entry Pass All Confirmed`,
      context: {
        community: this.community,
        event: this.event,
        eventDataFormEntityGroupId: this.eventDataFormEntityGroup.id,
        mailType: EemailTypes.ENTRY_PASS,
      },
    });
  }

  sendCSV() {
    this.eventDataFormEntityGroupsService.mailCSV(this.eventDataFormEntityGroupId).subscribe((data) => {
      if (data) {
        this.toastLogService.successDialog('CSV will be delivered to your email!', 5000);
      }
    });
  }

  bulkStatusChangeConfirmation(dialog: TemplateRef<any>) {
    this.dialogRef = this.dialogService.open(dialog);
    this.dialogRef.onClose.subscribe(() => {
      this.bulkStatus = null;
      this.bulkStatusChangeForCanceled = false;
    });
  }

  bulkStatusChange() {
    this.eventDataFormEntityGroupsService
      .changeBulkRegistrationStatus(
        this.fromRegistrationStatus,
        this.toRegistrationStatus,
        this.eventDataFormEntityGroupId,
        this.bulkStatusChangeForCanceled,
      )
      .subscribe((data) => {
        if (data) {
          this.getResponses();
          this.toastLogService.successDialog('Updated!');
        }
      });
    this.bulkStatus = null;
    this.dialogRef.close();
  }

  changeFromRegistrationStatus(event) {
    this.selectedRegistrationStatus = 0;
    this.fromRegistrationStatus = event.target.value;
    this.selectedRegistrationStatus =
      this.eventDataFormEntityGroup.summary_registration_counts[this.fromRegistrationStatus] || 0;
  }

  changeToRegistrationStatus(event) {
    this.toRegistrationStatus = event.target.value;
  }

  enableEditMode(question, i) {
    const newForm = this.fb.group({
      q: [question.id],
      v: [''],
    });
    this.forms[i] = newForm;
    question.editMode = true;
    const vControl = newForm.get('v');

    if (vControl) {
      vControl.valueChanges
        .pipe(
          debounceTime(800),
          switchMap(() => {
            this.rows = [];
            this.page = 1;
            this.emptyMessage = 'Loading...';
            return this.dataFormEntityResponseGroupsService.getEventDataFormResponses(
              this.eventDataFormEntityGroupId,
              this.searchForm.get('name').value.toLowerCase(),
              this.registrationStatusId,
              this.page,
              this.count,
              this.gender,
              this.selectedEventLocationTrackId,
              this.getFormData(),
              Object.keys(this.community_engagement_filters).length === 0 ? null : this.community_engagement_filters,
            );
          }),
        )
        .subscribe((data) => {
          this.setResponses(data);
        });
    }
  }

  disableEditMode(question, i) {
    question.editMode = false;
    if (this.forms[i] !== undefined && this.forms[i].get('v').value !== '') {
      this.forms[i] = null;
      this.getResponses();
    }
  }

  sendPaymentCsv() {
    this.eventDataFormEntityGroupsService.mailPaymentCSV(this.eventDataFormEntityGroupId).subscribe((data) => {
      if (data) {
        this.toastLogService.successDialog('Payment CSV will be delivered to your email!', 5000);
      }
    });
  }

  openUserEngagementFilter(userEngagementFilterTemplate) {
    this.getAttendeeEventList();
    if (Object.keys(this.community_engagement_filters).length === 0) {
      this.userEngagementFilter.reset();
    }

    this.dialogService.open(userEngagementFilterTemplate);
  }

  isApplyDisabled(): boolean {
    const formValues = this.userEngagementFilter.value;
    // Check for each checkbox; if checked, min and max must be filled
    const requiredFields = [
      {
        checkbox: 'show_total_channel_messages',
        min: 'min_total_channel_messages',
        max: 'max_total_channel_messages',
      },
      {
        checkbox: 'show_total_event_registrations',
        min: 'min_total_event_registrations',
        max: 'max_total_event_registrations',
      },
      {
        checkbox: 'show_total_event_speaker_registrations',
        min: 'min_total_event_speaker_registrations',
        max: 'max_total_event_speaker_registrations',
      },
      {
        checkbox: 'show_total_event_speaker_sessions',
        min: 'min_total_event_speaker_sessions',
        max: 'max_total_event_speaker_sessions',
      },
      {
        checkbox: 'show_total_hackathon_registrations',
        min: 'min_total_hackathon_registrations',
        max: 'max_total_hackathon_registrations',
      },
      {
        checkbox: 'show_total_invited_attended_events',
        min: 'min_total_invited_attended_events',
        max: 'max_total_invited_attended_events',
      },
      {
        checkbox: 'show_total_skipped_events',
        min: 'min_total_skipped_events',
        max: 'max_total_skipped_events',
      },
      {
        checkbox: 'show_total_uninvited_attended_events',
        min: 'min_total_uninvited_attended_events',
        max: 'max_total_uninvited_attended_events',
      },
      {
        checkbox: 'show_total_volunteered_events',
        min: 'min_total_volunteered_events',
        max: 'max_total_volunteered_events',
      },
    ];

    // Loop through requiredFields to check each condition
    return requiredFields.some((field) => {
      if (formValues[field.checkbox]) {
        // If checkbox is true, min and max values are required
        return !formValues[field.min] || !formValues[field.max];
      }
      return false;
    });
  }

  applyUserEngagementFilter() {
    this.isLoading = true;
    this.emptyMessage = 'Loading';
    this.community_engagement_filters = {};
    const formValues = this.userEngagementFilter.value;
    if (formValues.show_total_channel_messages) {
      this.community_engagement_filters.total_channel_messages = [
        formValues.min_total_channel_messages,
        formValues.max_total_channel_messages,
      ];
    }
    if (formValues.show_total_event_registrations) {
      this.community_engagement_filters.total_event_registrations = [
        formValues.min_total_event_registrations,
        formValues.max_total_event_registrations,
      ];
    }
    if (formValues.show_total_event_speaker_registrations) {
      this.community_engagement_filters.total_event_speaker_registrations = [
        formValues.min_total_event_speaker_registrations,
        formValues.max_total_event_speaker_registrations,
      ];
    }
    if (formValues.show_total_event_speaker_sessions) {
      this.community_engagement_filters.total_event_speaker_sessions = [
        formValues.min_total_event_speaker_sessions,
        formValues.max_total_event_speaker_sessions,
      ];
    }
    if (formValues.show_total_hackathon_registrations) {
      this.community_engagement_filters.total_hackathon_registrations = [
        formValues.min_total_hackathon_registrations,
        formValues.max_total_hackathon_registrations,
      ];
    }
    if (formValues.show_total_invited_attended_events) {
      this.community_engagement_filters.total_invited_attended_events = [
        formValues.min_total_invited_attended_events,
        formValues.max_total_invited_attended_events,
      ];
    }
    if (formValues.show_total_skipped_events) {
      this.community_engagement_filters.total_skipped_events = [
        formValues.min_total_skipped_events,
        formValues.max_total_skipped_events,
      ];
    }
    if (formValues.show_total_uninvited_attended_events) {
      this.community_engagement_filters.total_uninvited_attended_events = [
        formValues.min_total_uninvited_attended_events,
        formValues.max_total_uninvited_attended_events,
      ];
    }
    if (formValues.show_total_volunteered_events) {
      this.community_engagement_filters.total_volunteered_events = [
        formValues.min_total_volunteered_events,
        formValues.max_total_volunteered_events,
      ];
    }
    if (formValues.show_attended_events) {
      this.community_engagement_filters.attended_events = {
        attendance: formValues.attended_events_attendance,
        slugs: formValues.attended_events_slugs,
      };
    }
    this.getResponses();
  }

  clearUserEngagementFilter() {
    this.community_engagement_filters = {};
    this.getResponses();
  }

  hasCommunityEngagementFilters(): boolean {
    return Object.keys(this.community_engagement_filters).length > 0;
  }

  getAttendeeEventList() {
    if (!this.attendedEventList) {
      this.dataFormEntityResponseGroupsService
        .getAttendeeEventList(this.eventDataFormEntityGroupId)
        .subscribe((data) => {
          this.attendedEventList = data;
        });
    }
  }

  getFormData() {
    // Create a Map to hold unique keys
    const uniqueEntries = new Map();

    for (const form of this.forms) {
      if (form && form.get('v').value !== '') {
        const qValue = form.get('q').value;
        const vValue = form.get('v').value;

        // Update the Map with the latest value for each unique `q` key
        uniqueEntries.set(qValue, vValue);
      }
    }

    // Clear the formData and re-add only unique entries
    const formData = new FormData();
    uniqueEntries.forEach((vValue, qValue) => {
      formData.append(`qres[]q`, qValue);
      formData.append(`qres[]v`, vValue);
    });
    return formData;
  }
}
