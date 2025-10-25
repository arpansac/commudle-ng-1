/* eslint-disable @nx/enforce-module-boundaries */
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ColumnMode, SortType } from '@commudle/ngx-datatable';
import { NbDialogRef, NbDialogService, NbPopoverDirective, NbWindowService } from '@commudle/theme';
import { debounceTime, switchMap } from 'rxjs/operators';
import { faXmark, faFilter, faPieChart, faRefresh, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { AppUsersService, ToastrService } from '@commudle/shared-services';
import { EUserRoles, ICommunity, IEvent } from '@commudle/shared-models';
import { IEventDataFormEntityGroup } from 'apps/shared-models/event_data_form_enity_group.model';
import { IRegistrationStatus } from 'apps/shared-models/registration_status.model';
import { IDataForm } from 'apps/shared-models/data_form.model';
import { IQuestion } from 'apps/shared-models/question.model';
import { IEventLocationTrack } from 'apps/shared-models/event-location-track.model';
import { EQuestionTypes } from 'apps/shared-models/enums/question_types.enum';
import { RegistrationTypeNames } from 'apps/shared-models/registration_type.model';
import { IEventLocation } from 'apps/shared-models/event-location.model';
import { EventDataFormEntityGroupsService } from 'apps/commudle-admin/src/app/services/event-data-form-entity-groups.service';
import { RegistrationStatusesService } from 'apps/commudle-admin/src/app/services/registration-statuses.service';
import { DataFormEntityResponseGroupsService } from 'apps/commudle-admin/src/app/services/data-form-entity-response-groups.service';
import { EventLocationsService } from 'apps/commudle-admin/src/app/services/event-locations.service';
import { DataFormsService } from 'apps/commudle-admin/src/app/services/data_forms.service';
import { EmailerComponent } from 'apps/commudle-admin/src/app/app-shared-components/emailer/emailer.component';
import { EemailTypes } from 'apps/shared-models/enums/email_types.enum';

@Component({
  selector: 'commudle-event-form-responses',
  templateUrl: './event-form-responses.component.html',
  styleUrls: ['./event-form-responses.component.scss'],
})
export class EventFormResponsesComponent implements OnInit {
  @ViewChild('table') table;
  @ViewChild('confirmStatusChange', { read: TemplateRef }) confirmStatusChange: TemplateRef<HTMLElement>;
  @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;

  event: IEvent;
  community: ICommunity;
  eventDataFormEntityGroupId: number;
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
  selectedStatusIds: number[] = [];

  searchForm;

  showFullAnswer = false;

  userRoles = [];
  EUserRoles = EUserRoles;
  fromRegistrationStatus: string;
  toRegistrationStatus: string;
  selectedRegistrationStatus = 0;
  selectedGenders: string[] = [];
  eventLocationTracks: IEventLocationTrack[] = [];
  selectedEventLocationTrackId = 0;
  icons = {
    faXmark,
    faFilter,
    faPieChart,
    faRefresh,
    faChevronLeft,
  };
  editMode = false;

  forms: FormGroup[] = [];
  EQuestionTypes = EQuestionTypes;
  RegistrationTypeNames = RegistrationTypeNames;
  eventLocations: IEventLocation[];
  dialogRef: NbDialogRef<unknown>;
  userEngagementFilter: FormGroup;
  community_engagement_filters: Record<string, unknown> = {};
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
    private toastLogService: ToastrService,
    private appUsersService: AppUsersService,
    private eventLocationsService: EventLocationsService,
    private dialogService: NbDialogService,
    private router: Router,
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
            this.selectedStatusIds.length > 0 ? this.selectedStatusIds : [],
            this.page,
            this.count,
            this.selectedGenders.length > 0 ? this.selectedGenders : [''],
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
    this.selectedGenders = [];
    this.selectedStatusIds = [];
    this.selectedEventLocationTrackId = 0;
    this.community_engagement_filters = {};
  }

  registrationStatusFilter(event) {
    this.page = 1;
    this.selectedStatusIds = Array.isArray(event.target.value)
      ? event.target.value
      : [event.target.value].filter((v) => v !== 0);
    // this.getResponses();
  }

  genderFilter(event) {
    this.page = 1;
    this.selectedGenders = Array.isArray(event.target.value)
      ? event.target.value
      : [event.target.value].filter((v) => v !== '');
    // this.getResponses();
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
          this.selectedStatusIds.length > 0 ? this.selectedStatusIds : [],
          this.page,
          this.count,
          this.selectedGenders.length > 0 ? this.selectedGenders : [''],
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
    this.isLoading = true;
    this.rows = [];

    this.dataFormEntityResponseGroupsService
      .getEventDataFormResponses(
        this.eventDataFormEntityGroupId,
        this.searchForm.get('name').value?.toLowerCase() || '',
        this.selectedStatusIds.length > 0 ? this.selectedStatusIds : [],
        this.page,
        this.count,
        this.selectedGenders.length > 0 ? this.selectedGenders : [''],
        this.selectedEventLocationTrackId,
        this.getFormData(),
        Object.keys(this.community_engagement_filters).length === 0 ? null : this.community_engagement_filters,
      )
      .subscribe((data) => {
        this.setResponses(data);
      });
  }

  setResponses(data) {
    this.getEventDataFromEntityGroup();
    this.totalEntries = data?.total || 0;
    this.rows = data?.data_form_entity_response_groups || [];
    this.isLoading = false;
    this.emptyMessage = this.rows.length === 0 ? 'No entries found' : '';
  }

  getQuestionResponse(userResponses, questionId) {
    const userQuestionResponses = userResponses?.filter((k) => k.question_id === questionId) || [];
    return userQuestionResponses.length === 0
      ? 'No response'
      : userQuestionResponses.map((resp) => resp.response_text).join('\n');
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
      title: `Send Mails`,
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
      title: `Send Mails`,
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
              this.selectedStatusIds.length > 0 ? this.selectedStatusIds : [],
              this.page,
              this.count,
              this.selectedGenders.length > 0 ? this.selectedGenders : [''],
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

  private readonly requiredFields = [
    { checkbox: 'show_total_channel_messages', min: 'min_total_channel_messages', max: 'max_total_channel_messages' },
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
    { checkbox: 'show_total_skipped_events', min: 'min_total_skipped_events', max: 'max_total_skipped_events' },
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

  private isValidValue = (value: any) => value !== null && value !== undefined && value !== '';

  isApplyDisabled(): boolean {
    const formValues = this.userEngagementFilter.value;

    if (
      formValues['show_attended_events'] &&
      (!this.isValidValue(formValues['attended_events_attendance']) ||
        !this.isValidValue(formValues['attended_events_slugs']))
    ) {
      return true;
    }

    return this.requiredFields.some((field) => {
      if (!formValues[field.checkbox]) return false;

      const minValue = formValues[field.min];
      const maxValue = formValues[field.max];

      return !this.isValidValue(minValue) || !this.isValidValue(maxValue) || Number(minValue) > Number(maxValue);
    });
  }

  private readonly filterMappings = [
    {
      checkbox: 'show_total_channel_messages',
      key: 'total_channel_messages',
      min: 'min_total_channel_messages',
      max: 'max_total_channel_messages',
    },
    {
      checkbox: 'show_total_event_registrations',
      key: 'total_event_registrations',
      min: 'min_total_event_registrations',
      max: 'max_total_event_registrations',
    },
    {
      checkbox: 'show_total_event_speaker_registrations',
      key: 'total_event_speaker_registrations',
      min: 'min_total_event_speaker_registrations',
      max: 'max_total_event_speaker_registrations',
    },
    {
      checkbox: 'show_total_event_speaker_sessions',
      key: 'total_event_speaker_sessions',
      min: 'min_total_event_speaker_sessions',
      max: 'max_total_event_speaker_sessions',
    },
    {
      checkbox: 'show_total_hackathon_registrations',
      key: 'total_hackathon_registrations',
      min: 'min_total_hackathon_registrations',
      max: 'max_total_hackathon_registrations',
    },
    {
      checkbox: 'show_total_invited_attended_events',
      key: 'total_invited_attended_events',
      min: 'min_total_invited_attended_events',
      max: 'max_total_invited_attended_events',
    },
    {
      checkbox: 'show_total_skipped_events',
      key: 'total_skipped_events',
      min: 'min_total_skipped_events',
      max: 'max_total_skipped_events',
    },
    {
      checkbox: 'show_total_uninvited_attended_events',
      key: 'total_uninvited_attended_events',
      min: 'min_total_uninvited_attended_events',
      max: 'max_total_uninvited_attended_events',
    },
    {
      checkbox: 'show_total_volunteered_events',
      key: 'total_volunteered_events',
      min: 'min_total_volunteered_events',
      max: 'max_total_volunteered_events',
    },
  ];

  applyUserEngagementFilter() {
    this.isLoading = true;
    this.emptyMessage = 'Loading';
    this.community_engagement_filters = {};
    const formValues = this.userEngagementFilter.value;

    this.filterMappings.forEach((mapping) => {
      if (formValues[mapping.checkbox]) {
        this.community_engagement_filters[mapping.key] = [formValues[mapping.min], formValues[mapping.max]];
      }
    });

    if (formValues.show_attended_events && formValues.attended_events_attendance && formValues.attended_events_slugs) {
      this.community_engagement_filters.attended_events = {
        attendance: formValues.attended_events_attendance,
        slugs: [formValues.attended_events_slugs],
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

  goBack(): void {
    this.router.navigate([
      '/admin/communities',
      this.community.slug,
      'event-dashboard',
      this.event.slug,
      'registrations',
    ]);
  }

  getFormData() {
    const uniqueEntries = new Map();

    this.forms.forEach((form) => {
      if (form?.get('v')?.value) {
        uniqueEntries.set(form.get('q').value, form.get('v').value);
      }
    });

    const formData = new FormData();
    uniqueEntries.forEach((vValue, qValue) => {
      formData.append('qres[]q', qValue);
      formData.append('qres[]v', vValue);
    });

    return formData;
  }

  openPopover() {
    this.popover.show();
  }
  closePopover() {
    this.popover.hide();
  }

  onStatusChange(event: Event, statusId: number) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedStatusIds.push(statusId);
    } else {
      this.selectedStatusIds = this.selectedStatusIds.filter((id) => id !== statusId);
    }
    this.registrationStatusFilter({ target: { value: this.selectedStatusIds } });
  }

  onGenderChange(event: Event, genderValue: string) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedGenders.push(genderValue);
    } else {
      this.selectedGenders = this.selectedGenders.filter((g) => g !== genderValue);
    }
    this.genderFilter({ target: { value: this.selectedGenders } });
  }

  applyFilter() {
    this.getResponses();
    this.closePopover();
  }
}
