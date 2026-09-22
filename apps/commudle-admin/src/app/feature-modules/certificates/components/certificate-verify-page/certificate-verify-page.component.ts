import { Clipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommudleButtonModule, CommudleCardModule } from '@commudle/commudle-theme';
import { ICertificatePublicRecipient } from '@commudle/shared-models';
import { CertificateRecipientService, ShareService } from '@commudle/shared-services';
import { environment } from 'apps/commudle-admin/src/environments/environment';
import {
  faCalendarDays,
  faCircleCheck,
  faClock,
  faCopy,
  faDownload,
  faFileLines,
  faLandmark,
  faLink,
  faShareNodes,
  faShieldHalved,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import * as moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { SharedPipesModule } from 'apps/shared-pipes/pipes.module';
import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';

@Component({
  selector: 'commudle-certificate-verify-page',
  standalone: true,
  imports: [
    CommonModule,
    CommudleCardModule,
    CommudleButtonModule,
    FontAwesomeModule,
    SharedComponentsModule,
    SharedPipesModule,
  ],
  templateUrl: './certificate-verify-page.component.html',
  styleUrls: ['./certificate-verify-page.component.scss'],
})
export class CertificateVerifyPageComponent implements OnInit, OnDestroy {
  recipient: ICertificatePublicRecipient | null = null;
  isLoading = true;
  notFound = false;
  verificationLink = '';
  verifiedOnLabel = '';
  pdfObjectUrl: string | null = null;
  icons = {
    faCalendarDays,
    faCircleCheck,
    faClock,
    faCopy,
    faDownload,
    faFileLines,
    faLandmark,
    faLink,
    faShareNodes,
    faShieldHalved,
    faUser,
  };

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private certificateRecipientService: CertificateRecipientService,
    private clipboard: Clipboard,
    private shareService: ShareService,
    private toastLogService: LibToastLogService,
  ) {}

  ngOnInit() {
    const uuid = this.route.snapshot.paramMap.get('uuid');
    this.certificateRecipientService
      .verifyCertificate(uuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (recipient) => {
          this.recipient = recipient;
          this.verificationLink = `${environment.app_url}/certificates/verify/${recipient.uuid}`;
          this.verifiedOnLabel = this.formatVerifiedOn(new Date());
          this.isLoading = false;
          if (recipient.pdf_url) {
            this.loadPdfPreview(recipient.uuid);
          }
        },
        error: () => {
          this.notFound = true;
          this.isLoading = false;
        },
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.pdfObjectUrl) {
      URL.revokeObjectURL(this.pdfObjectUrl);
    }
  }

  // Fetched as bytes rather than linked directly via `<object data>` -
  // a direct link is subject to the response's Content-Disposition and
  // X-Frame-Options headers, neither of which apply to a JS-level fetch.
  // Same pattern as certificate-recipient-preview-dialog.
  private loadPdfPreview(uuid: string) {
    this.certificateRecipientService
      .downloadCertificatePdf(uuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          this.pdfObjectUrl = URL.createObjectURL(blob);
        },
        error: () => {
          this.toastLogService.errorDialog('Could not load the certificate preview');
        },
      });
  }

  private formatVerifiedOn(date: Date): string {
    const datePart = moment(date).format('MMM D, YYYY · h:mm A');
    const tzName = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
      .formatToParts(date)
      .find((part) => part.type === 'timeZoneName')?.value;
    return tzName ? `${datePart} (${tzName})` : datePart;
  }

  copyToClipboard(text: string) {
    if (this.clipboard.copy(text)) {
      this.toastLogService.successDialog('Copied to clipboard');
    }
  }

  shareCertificate() {
    if (!this.recipient) {
      return;
    }
    if (!this.shareService.canShare()) {
      this.copyToClipboard(this.verificationLink);
      return;
    }
    this.shareService
      .share({
        title: `${this.recipient.recipient_name || 'Certificate'} - ${this.recipient.title}`,
        url: this.verificationLink,
      })
      .then(() => {
        this.toastLogService.successDialog('Shared successfully');
      });
  }
}
