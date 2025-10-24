/* eslint-disable @nx/enforce-module-boundaries */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { IHackathonUserResponses } from 'apps/shared-models/hackathon-user-responses.model';
import * as moment from 'moment';
import { RoundService, ToastrService, NoteService, EmailerPreviewService, SeoService } from '@commudle/shared-services';
import { NbDialogRef, NbDialogService } from '@commudle/theme';
import {
  EDbModels,
  EHackathonRegistrationStatus,
  EHackathonRegistrationStatusColor,
  EInvitationStatus,
  IHackathonTeam,
  IHackathonTrack,
  IHackathonUserResponse,
  INote,
  IRound,
  ICommunity,
} from '@commudle/shared-models';
import { faXmark, faPlus, faCheck, faUpRightFromSquare, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IHackathon, EHackathonStatus } from 'apps/shared-models/hackathon.model';
import { HackathonUserResponsesService } from 'apps/commudle-admin/src/app/services/hackathon-user-responses.service';
import { HackathonOverallRoundSelectionUpdateEmailComponent } from 'apps/commudle-admin/src/app/feature-modules/hackathon-control-panel/components/hackathon-control-panel-emails/hackathon-overall-round-selection-update-email/hackathon-overall-round-selection-update-email.component';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { HackathonIndividualTeamEmailComponent } from 'apps/commudle-admin/src/app/feature-modules/hackathon-control-panel/components/hackathon-control-panel-emails/hackathon-individual-team-email/hackathon-individual-team-email.component';
import { EmailPreviewComponent } from 'apps/commudle-admin/src/app/app-shared-components/email-preview/email-preview.component';
import { ICommunityGroup } from 'apps/shared-models/community-group.model';

@Component({
  selector: 'commudle-hackathon-control-panel-review',
  templateUrl: './hackathon-control-panel-review.component.html',
  styleUrls: ['./hackathon-control-panel-review.component.scss'],
})
export class HackathonControlPanelReviewComponent implements OnInit, OnDestroy {
  userResponses: IHackathonUserResponses[];
  selectedUserResponse: IHackathonUserResponses;
  hackathon: IHackathon;
  hackathonId: string;
  moment = moment;
  EHackathonRegistrationStatus = EHackathonRegistrationStatus;
  EHackathonRegistrationStatusColor = EHackathonRegistrationStatusColor;
  hackathonRounds: IRound[];
  hackathonTracks: IHackathonTrack[];
  selectedUserDetails: IHackathonUserResponse;
  faXmark = faXmark;
  faPlus = faPlus;
  faCheck = faCheck;
  faUpRightFromSquare = faUpRightFromSquare;
  faEnvelope = faEnvelope;
  notesForm;
  notes: INote[];
  dialogRef: NbDialogRef<unknown>;
  EHackathonStatus = EHackathonStatus;
  roundSelectionForEmail = 0;
  message = '';
  selectedTeamDetails: IHackathonTeam;
  selectedUserResponsesDetails: IHackathonUserResponse[];
  EInvitationStatus = EInvitationStatus;
  selectedResponse;
  isLoading = false;
  searchForm: FormGroup;

  page = 1;
  total: number;
  count = 10;

  selectedRoundIdForFilter = '';
  selectedStatusForFilter = '';
  selectedTrackForFilter = '';
  showOnlyWinnerEntry = false;

  dialogReference: NbDialogRef<any>;
  sendEmailDialogRef: NbDialogRef<any>;
  confirmSendEmailDialogRef: NbDialogRef<any>;
  confirmationDialogReference: NbDialogRef<any>;
  parent: ICommunity | ICommunityGroup;
  subscriptions: Subscription[] = [];

  tinyMCE = {
    height: 200,
    menubar: false,
    convert_urls: false,
    content_style:
      "@import url('https://fonts.googleapis.com/css?family=Inter'); body {font-family: 'Inter'; font-size: 16px !important;}",
    plugins: [
      'advlist',
      'autolink',
      'lists',
      'link',
      'image',
      'charmap',
      'preview',
      'anchor',
      'searchreplace',
      'visualblocks',
      'code',
      'fullscreen',
      'insertdatetime',
      'media',
      'table',
      'code',
      'help',
      'wordcount',
    ],
    toolbar:
      'h2  h3  h4  h5 fontsize | undo redo | formatselect | bold italic backcolor forecolor | \
        alignleft aligncenter alignright alignjustify | \
        bullist numlist outdent indent | removeformat | help',
    font_size_formats: '8px 10px 12px 14px 16px 18px 20px 22px 24px',
    license_key: 'gpl',
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private hackathonService: HackathonService,
    private toastrService: ToastrService,
    private nbDialogService: NbDialogService,
    private roundService: RoundService,
    private noteService: NoteService,
    private fb: FormBuilder,
    private hurService: HackathonUserResponsesService,
    private hackathonEmailPreview: EmailerPreviewService,
    private router: Router,
    private seoService: SeoService,
  ) {
    this.notesForm = this.fb.group({
      note: this.fb.array([]),
    });
    this.searchForm = this.fb.group({
      search: [''],
    });
  }

  get notesList() {
    return this.notesForm.get('note') as FormArray;
  }

  ngOnInit() {
    this.seoService.noIndex(true);
    this.subscriptions.push(
      this.activatedRoute.parent.paramMap.subscribe((params) => {
        this.hackathonId = params.get('hackathon_id');
        this.fetchUserResponses();
        this.fetchHackathon(params.get('hackathon_id'));
        this.indexRounds(params.get('hackathon_id'));
        this.indexTracks(params.get('hackathon_id'));
      }),
    );

    this.searchForm.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(() => {
      this.page = 1;
      this.fetchUserResponses();
    });
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
    this.dialogRef?.close();
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  fetchHackathon(hackathonId) {
    this.subscriptions.push(
      this.hackathonService.showHackathon(hackathonId).subscribe((data: IHackathon) => {
        this.hackathon = data;
        // TODO: Add Community Group in Future
        if (data.community) {
          this.parent = data.community;
        }
        if (this.parent && this.hackathon) {
          this.setMeta();
        }
      }),
    );
  }

  fetchUserResponses() {
    this.isLoading = true;
    this.hackathonService
      .indexUserResponses(
        this.hackathonId,
        this.page,
        this.count,
        this.searchForm.get('search').value,
        Number(this.selectedRoundIdForFilter),
        this.selectedStatusForFilter,
        this.showOnlyWinnerEntry,
        Number(this.selectedTrackForFilter),
      )
      .subscribe((data) => {
        this.userResponses = data.values;
        this.page = data.page;
        this.total = data.total;
        this.isLoading = false;
      });
  }

  optionChanged(event, teamId: number, index: number) {
    this.hackathonService.changeTeamStatus(teamId, event).subscribe((data) => {
      this.toastrService.successDialog('Details has been updated successfully');
      this.closeConfirmationDialogBox();
      this.userResponses[index].team = data;
      this.userResponses[index].team.registration_status = data.registration_status;
      this.previousStatus = data.registration_status;
      this.selectedTeamDetails = data;
    });
  }

  indexRounds(hackathonId) {
    this.roundService.indexRounds(hackathonId, EDbModels.HACKATHON).subscribe((data: IRound[]) => {
      this.hackathonRounds = data;
    });
  }

  indexTracks(hackathonId) {
    this.hackathonService.indexTracks(hackathonId).subscribe((data) => {
      this.hackathonTracks = data;
    });
  }

  openDialogBox(dialog, teamId, index) {
    this.hackathonService.showUserResponsesByTeam(teamId).subscribe((data: IHackathonUserResponses) => {
      this.selectedTeamDetails = data.team;
      this.selectedUserResponsesDetails = data.user_responses;
      this.selectedUserResponse = data;
      this.notesIndex(data.team.id);
      this.selectedUserDetails = this.selectedUserResponsesDetails[0];
      this.getQuestionAnswer();
      this.dialogRef = this.nbDialogService.open(dialog, {
        context: { team: this.selectedTeamDetails, index: index, userResponse: this.selectedUserResponsesDetails },
      });
    });
  }
  getQuestionAnswer() {
    this.selectedResponse = [];
    this.hurService.getDataFormResponses(this.selectedUserDetails.id).subscribe((data) => {
      this.selectedResponse = data;
    });
  }

  openRoundSelectionUpdateEmailDialogBox() {
    this.dialogRef = this.nbDialogService.open(HackathonOverallRoundSelectionUpdateEmailComponent, {
      context: {
        hackathonId: this.hackathon.id,
        roundSelection: this.selectedRoundIdForFilter ? Number(this.selectedRoundIdForFilter) : 0,
      },
    });
  }

  changeRoundOption(event, teamId, index) {
    this.hackathonService.changeTeamRound(teamId, event).subscribe((data) => {
      this.toastrService.successDialog('Details has been updated successfully');
      this.userResponses[index].team.round = data.round;
    });
  }

  displayUserData(user) {
    this.selectedUserDetails = user;
    this.getQuestionAnswer();
  }

  addNote(noteText = '') {
    this.notesList.push(this.fb.group({ value: new FormControl(noteText, [Validators.required]) }));
  }

  removeNote(index) {
    this.notesList.removeAt(index);
  }

  updateNotes(selectedUserResponse: IHackathonUserResponses) {
    const teamId = selectedUserResponse.team.id;
    for (const note of this.notesForm.value.note) {
      if (note.value !== '') {
        const formData = new FormData();
        formData.append('note[text]', note.value);
        this.noteService.createNote(formData, EDbModels.HACKATHON_TEAM, teamId).subscribe((data) => {
          for (let index = 0; index < this.notesList.length; index++) {
            this.removeNote(index);
          }
          this.notes.push(data);
          const userResponseIndex = this.userResponses.findIndex((userResponse) => userResponse.team.id === teamId);
          this.userResponses[userResponseIndex].team.notes.push(data);
        });
      }
    }
  }

  notesIndex(teamId) {
    this.noteService.indexNotes(teamId, EDbModels.HACKATHON_TEAM).subscribe((data) => {
      this.notes = data;
    });
  }

  generateTeamRegistrationStatusNotification(teamId) {
    this.hackathonService.generateTeamRegistrationStatusNotification(teamId).subscribe((data) => {
      if (data) {
        this.selectedTeamDetails.acceptance_mail_sent = true;
        this.toastrService.successDialog('Emails are being delivered!');
        this.selectedTeamDetails.acceptance_mail_sent = true;
      }
    });
  }

  OverallRoundSelectionUpdateEmail() {
    if (this.roundSelectionForEmail > 0) {
      this.hackathonService
        .OverallRoundSelectionUpdateEmail(this.hackathon.id, this.roundSelectionForEmail, this.message)
        .subscribe((data) => {
          if (data) this.toastrService.successDialog('Emails are being delivered!');
        });
    }
  }

  destroyNote(noteId, index, selectedUserResponse) {
    const teamId = selectedUserResponse.team.id;
    this.noteService.destroyNote(noteId).subscribe((data) => {
      if (data) {
        this.notes.splice(index, 1);
        const userResponseIndex = this.userResponses.findIndex((userResponse) => userResponse.team.id === teamId);
        const noteIndex = this.userResponses[userResponseIndex].team.notes.findIndex((note) => note.id === noteId);
        this.userResponses[userResponseIndex].team.notes.splice(noteIndex, 1);
      }
    });
  }

  sendTeamDetailsCsv() {
    this.hackathonService.sendTeamDetailCsv(this.hackathon.id).subscribe((data) => {
      if (data) {
        this.toastrService.successDialog('CSV is being generated, it will be emailed to you shortly!');
      }
    });
  }

  onRoundChange(event) {
    this.selectedRoundIdForFilter = event.target.value;
    this.page = 1;
    this.fetchUserResponses();
  }

  onTrackChange(event) {
    this.selectedTrackForFilter = event.target.value;
    this.page = 1;
    this.fetchUserResponses();
  }

  onSelectWinnerChange(event) {
    this.showOnlyWinnerEntry = event.target.value;
    this.page = 1;
    this.fetchUserResponses();
  }

  onStatusChange(event) {
    this.selectedStatusForFilter = event.target.value;
    this.page = 1;
    this.fetchUserResponses();
  }

  clearAllFilter() {
    if (this.selectedStatusForFilter || this.selectedRoundIdForFilter || this.selectedTrackForFilter) {
      this.selectedStatusForFilter = '';
      this.selectedRoundIdForFilter = '';
      this.selectedTrackForFilter = '';
      this.page = 1;
      this.fetchUserResponses();
    }
  }

  openIndividualTeamEmailDialogBox(hackathonTeam: IHackathonTeam) {
    this.nbDialogService.open(HackathonIndividualTeamEmailComponent, {
      context: {
        hackathonTeam: hackathonTeam,
      },
    });
  }

  openSendApplicationStatusEmailsDialogBox(dialogBox) {
    this.sendEmailDialogRef = this.nbDialogService.open(dialogBox);
  }

  hackathonSendTeamStatusEmailByFilterEmailPreview(hackathonTeamRegistrationStatus: EHackathonRegistrationStatus) {
    this.hackathonEmailPreview
      .hackathonSendTeamStatusEmailByFilterEmailPreview(this.hackathon.id, hackathonTeamRegistrationStatus)
      .subscribe((data) => {
        this.openEmailPreviewTemplate(data.preview);
      });
  }

  hackathonSendTeamStatusEmailByFilter(hackathonTeamRegistrationStatus: EHackathonRegistrationStatus) {
    this.hackathonService
      .hackathonSendTeamStatusEmailByFilter(this.hackathon.id, hackathonTeamRegistrationStatus)
      .subscribe((data) => {
        if (data) {
          this.toastrService.successDialog('Emails are being sent!');
          this.sendEmailDialogRef.close();
          this.confirmSendEmailDialogRef.close();
        }
      });
  }

  openEmailPreviewTemplate(previewData) {
    this.dialogReference = this.nbDialogService.open(EmailPreviewComponent, {
      context: { previewData },
    });
  }

  openConfirmSendApplicationEmailPopup(dialogBox, hackathonTeamRegistrationStatus) {
    this.confirmSendEmailDialogRef = this.nbDialogService.open(dialogBox, {
      context: { hackathonTeamRegistrationStatus: hackathonTeamRegistrationStatus },
    });
  }

  goToEmails() {
    this.router.navigate(['../emails'], { relativeTo: this.activatedRoute });
  }

  setMeta() {
    this.seoService.setTitle(`Applications & Projects | Dashboard | ${this.hackathon.name} | ${this.parent.name}`);
    this.seoService.noIndex(true);
  }

  previousStatus: EHackathonRegistrationStatus | null = null;

  onSelectFocus(previousValue: EHackathonRegistrationStatus) {
    // Store the old value before change
    this.previousStatus = previousValue;
  }

  openConfirmationDialogBox(
    templateRef,
    event,
    teamId: number,
    index: number,
    previousValue?: EHackathonRegistrationStatus,
  ) {
    const newValue = event.target.value;
    // Revert the visible select back until user confirms
    event.target.value = this.previousStatus;
    this.userResponses[index].team.registration_status = this.previousStatus;

    this.confirmationDialogReference = this.nbDialogService.open(templateRef, {
      context: {
        event: newValue,
        teamId: teamId,
        index: index,
        previousValue: previousValue,
        newValue: newValue,
      },
    });
  }

  confirmApplicationStatusChange(newStatus: string, teamId: number, index: number) {
    this.userResponses[index].team.registration_status = newStatus as EHackathonRegistrationStatus;
    this.optionChanged(newStatus, teamId, index);
  }

  closeConfirmationDialogBox() {
    this.confirmationDialogReference.close();
  }

  openRoundConfirmationDialogBox(templateRef, event, teamId: number, index: number, previousRoundId?: number) {
    const selectedRoundId = event.target.value;
    const selectedRound = this.hackathonRounds.find((round) => round.id == selectedRoundId);

    // Revert the visible select back until user confirms
    event.target.value = previousRoundId;
    this.userResponses[index].team.round = this.hackathonRounds.find((round) => round.id == previousRoundId);

    this.confirmationDialogReference = this.nbDialogService.open(templateRef, {
      context: {
        event: selectedRoundId,
        roundName: selectedRound?.name,
        teamId: teamId,
        index: index,
        previousValue: previousRoundId,
      },
    });
  }
}
