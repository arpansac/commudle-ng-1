import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NbToastrService, NbWindowService } from '@commudle/theme';
import { ICommunity } from 'apps/shared-models/community.model';
import { ISpeakerResource } from 'apps/shared-models/speaker_resource.model';
import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';
import { CommunitiesService } from '../../services/communities.service';
import { SpeakerResourcesService } from '../../services/speaker-resources.service';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';
import { ICurrentUser } from 'apps/shared-models/current_user.model';
import { LibAuthwatchService } from 'apps/shared-services/lib-authwatch.service';
import { AppUsersService } from 'apps/commudle-admin/src/app/services/app-users.service';
import { EAttachmentType } from '@commudle/shared-models';
import { IUserStat } from '@commudle/shared-models';
import { validate } from 'uuid';
import { Subject, takeUntil } from 'rxjs';
import { PdfXssValidationService } from '@commudle/shared-components';

@Component({
  selector: 'app-speaker-resource-form',
  templateUrl: './speaker-resource-form.component.html',
  styleUrls: ['./speaker-resource-form.component.scss'],
  standalone: false,
})
export class SpeakerResourceFormComponent implements OnInit, OnDestroy {
  token: string;
  eventId: number;
  speakerResource: ISpeakerResource;
  community: ICommunity;
  embedGoogleSlidesCode: any;
  staticAssets = staticAssets;
  currentUser: ICurrentUser;
  userProfileDetails: IUserStat;
  uploadedPdf: File;
  uploadedPdfSrc = '';
  EAttachmentType = EAttachmentType;
  source: string;

  @ViewChild('googleSlidesEmbed', { read: TemplateRef }) googleSlidesEmbedTemplate: TemplateRef<HTMLElement>;

  speakerResourceForm;

  @ViewChild('fileInput') fileInput: any;
  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private speakerResourcesService: SpeakerResourcesService,
    private fb: FormBuilder,
    private windowService: NbWindowService,
    private sanitizer: DomSanitizer,
    private communitiesService: CommunitiesService,
    private toastLogService: LibToastLogService,
    private nbToastrService: NbToastrService,
    private router: Router,
    private authWatchService: LibAuthwatchService,
    private appUsersService: AppUsersService,
    private pdfXssValidationService: PdfXssValidationService,
  ) {
    this.speakerResourceForm = this.fb.group(
      {
        title: ['', Validators.required],
        embedded_content: [''],
        session_details_links: ['', Validators.required],
        attachment_type: ['link'],
      },
      {
        validators: [
          (fb) =>
            (fb.get('attachment_type').value === EAttachmentType.LINK ||
              fb.get('attachment_type').value === EAttachmentType.EMBEDDED_LINK) &&
            !fb.get('embedded_content').value
              ? { embedded_content: true }
              : null,
        ],
      },
    );
  }

  ngOnInit() {
    this.authWatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((data) => (this.currentUser = data));
    this.appUsersService.getProfileStats().subscribe((data) => {
      this.userProfileDetails = data;
    });

    this.activatedRoute.queryParams.subscribe((data) => {
      this.token = data['token'];
      this.eventId = data['event_id'];
      this.getSpeakerResource();
    });
  }

  getSpeakerResource() {
    this.speakerResourcesService.getByToken(this.token, this.eventId).subscribe((data) => {
      this.speakerResource = data;
      if (data.presentation_file) {
        this.uploadedPdfSrc = data.presentation_file.url;
      }

      if (data.embedded_content) {
        this.speakerResourceForm.get('embedded_content').valueChanges.subscribe((val) => {
          if (val.startsWith('<iframe src=') && val.endsWith('</iframe>')) {
            this.embedGoogleSlidesCode = this.sanitizer.bypassSecurityTrustHtml(val);
          } else {
            this.embedGoogleSlidesCode = null;
          }
        });
      }

      if (this.speakerResource.id) {
        this.prefillForm();
      }
      this.getCommunity();
    });
  }

  getCommunity() {
    this.communitiesService
      .getCommunityDetails(this.speakerResource.event.kommunity_id)
      .subscribe((data) => (this.community = data));
  }

  prefillForm() {
    this.speakerResourceForm.patchValue({
      title: this.speakerResource.title,
      embedded_content: this.speakerResource.embedded_content,
      session_details_links: this.speakerResource.session_details_links,
      attachment_type: this.speakerResource.attachment_type,
    });
  }

  submitForm() {
    if (
      this.speakerResourceForm.invalid ||
      (this.speakerResourceForm.get('attachment_type').value === EAttachmentType.PDF_FILE && this.uploadedPdfSrc === '')
    ) {
      this.toastLogService.warningDialog('Required Field');
      return;
    }
    this.speakerResourcesService
      .createOrUpdateByToken(this.token, this.getSpeakerResponseFormData(), this.eventId)
      .subscribe((data) => {
        this.toastLogService.successDialog('Saved!');
        this.router.navigate(['/communities', this.community.slug, 'events', this.speakerResource.event.slug]);
      });
  }

  getSpeakerResponseFormData(): FormData {
    const formData = new FormData();
    const srfValue = this.speakerResourceForm.value;

    Object.keys(srfValue).forEach((key) => {
      if (srfValue[key] !== null && srfValue[key] !== undefined && srfValue[key] !== '') {
        formData.append(`speaker_resource[${key}]`, srfValue[key]);
      }
    });

    if (this.uploadedPdf != null) {
      formData.append('speaker_resource[presentation_file]', this.uploadedPdf);
    }
    return formData;
  }

  openGoogleSlidesEmbedStepsWindow() {
    this.windowService.open(this.googleSlidesEmbedTemplate, { title: 'Steps to get Google Slides Embed Link' });
  }

  onFileChange(event) {
    if (event.target.files && event.target.files.length) {
      const file = event.target.files[0];

      if (file.type !== 'application/pdf') {
        this.nbToastrService.warning('File must be a pdf', 'Warning');
        event.target.value = '';
        return;
      }

      if (file.size > 30000000) {
        this.nbToastrService.warning('File must be less than 30MB', 'Warning');
        event.target.value = '';
        return;
      }

      // Read and check the file for XSS
      this.pdfXssValidationService.checkPdfFileForXss(file).then((isSafe) => {
        if (!isSafe) {
          this.nbToastrService.warning("PDF contains unsafe content, You can't upload that file", 'Warning');
          this.uploadedPdf = null;
          this.uploadedPdfSrc = '';
          event.target.value = '';
          return;
        }

        this.uploadedPdf = file;

        const reader = new FileReader();
        reader.onload = () => {
          this.uploadedPdfSrc = reader.result as string;
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removePdfFile() {
    if (!this.uploadedPdfSrc) {
      this.fileInput.nativeElement.value = '';
    }
    this.uploadedPdf = null;
    this.uploadedPdfSrc = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
