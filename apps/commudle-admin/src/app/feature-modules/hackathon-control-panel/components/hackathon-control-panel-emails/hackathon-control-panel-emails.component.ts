/* eslint-disable @nx/enforce-module-boundaries */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NbDialogRef, NbDialogService } from '@commudle/theme';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { HackathonWinnerAnnouncementEmailerComponent } from 'apps/commudle-admin/src/app/feature-modules/hackathon-control-panel/components/hackathon-control-panel-emails/hackathon-winner-announcement-emailer/hackathon-winner-announcement-emailer.component';
import { HackathonStatusFilterGeneralEmailsComponent } from 'apps/commudle-admin/src/app/feature-modules/hackathon-control-panel/components/hackathon-control-panel-emails/hackathon-status-filter-general-emails/hackathon-status-filter-general-emails.component';
import { HackathonRoundGeneralMailerComponent } from 'apps/commudle-admin/src/app/feature-modules/hackathon-control-panel/components/hackathon-control-panel-emails/hackathon-round-general-mailer/hackathon-round-general-mailer.component';
import { ToastrService } from '@commudle/shared-services';
import { FormBuilder } from '@angular/forms';
import { EmailerPreviewService } from '@commudle/shared-services';
import { EmailPreviewComponent } from 'apps/commudle-admin/src/app/app-shared-components/email-preview/email-preview.component';
@Component({
  selector: 'commudle-hackathon-control-panel-emails',
  templateUrl: './hackathon-control-panel-emails.component.html',
  styleUrls: ['./hackathon-control-panel-emails.component.scss'],
})
export class HackathonControlPanelEmailsComponent implements OnInit {
  hackathonId: number | string;
  message = '';
  dialogRef: NbDialogRef<any>;
  isLoading = false;
  showPreviewSpinner = false;
  previewEmailForm;
  previewData: string;

  tinyMCE = {
    min_height: 300,
    menubar: false,
    convert_urls: false,
    placeholder: 'Write additional message',
    content_style:
      "@import url('https://fonts.googleapis.com/css?family=Inter'); body {font-family: 'Inter'; font-size: 16px !important;}",
    plugins: [
      'emoticons',
      'advlist',
      'lists',
      'autolink',
      'link',
      'charmap',
      'preview',
      'anchor',
      'image',
      'visualblocks',
      'code',
      'charmap',
      'codesample',
      'insertdatetime',
      'table',
      'code',
      'help',
      'wordcount',
      'autoresize',
      'media',
    ],
    toolbar:
      'bold italic backcolor | codesample emoticons | link | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | media code | removeformat | table',
    default_link_target: '_blank',
    branding: false,
    license_key: 'gpl',
  };

  constructor(
    private nbDialogService: NbDialogService,
    private hackathonService: HackathonService,
    private activatedRoute: ActivatedRoute,
    private toasterService: ToastrService,
    private fb: FormBuilder,
    private emailerPreviewService: EmailerPreviewService,
  ) {
    this.previewEmailForm = this.fb.group({
      body: [''],
    });
  }

  ngOnInit() {
    this.activatedRoute.parent.paramMap.subscribe((params) => {
      this.hackathonId = params.get('hackathon_id');
    });
  }

  openDialogBox(dialog) {
    this.dialogRef = this.nbDialogService.open(dialog);
  }

  openDialogBoxForWinnerAnnouncement(hackathonId) {
    this.dialogRef = this.nbDialogService.open(HackathonWinnerAnnouncementEmailerComponent, {
      context: { hackathonId },
    });
  }

  openDialogBoxForStatusFilterGeneralEmail(hackathonId) {
    this.dialogRef = this.nbDialogService.open(HackathonStatusFilterGeneralEmailsComponent, {
      context: { hackathonId },
    });
  }

  openDialogBoxForRoundGeneralEmail(hackathonId) {
    this.dialogRef = this.nbDialogService.open(HackathonRoundGeneralMailerComponent, {
      context: { hackathonId },
    });
  }

  SendRegistrationsMailer() {
    this.isLoading = true;
    this.hackathonService.inviteUserByEmail(this.hackathonId, this.message).subscribe(
      (data) => {
        if (data) {
          this.toasterService.successDialog('Email sent successfully, Will be delivered soon!');
        }
        this.closeDialogBox();
      },
      () => {
        this.closeDialogBox();
      },
    );
  }

  closeDialogBox() {
    this.message = '';
    this.isLoading = false;
    this.dialogRef.close();
  }

  previewEmail(hackathonId) {
    this.previewEmailForm.patchValue({
      body: this.message,
    });
    this.emailerPreviewService
      .hackathonInviteRegistrationEmailPreview(this.previewEmailForm.value, hackathonId)
      .subscribe((result) => {
        this.previewData = result.preview;
        this.openEmailPreviewTemplate(this.previewData);
        this.showPreviewSpinner = false;
      });
  }

  openEmailPreviewTemplate(previewData) {
    this.dialogRef = this.nbDialogService.open(EmailPreviewComponent, {
      context: { previewData },
    });
  }
}
