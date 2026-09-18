import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NbCheckboxModule, NbDialogService, NbInputModule } from '@commudle/theme';
import { CommudleButtonModule } from '@commudle/commudle-theme';
import { ECertificateBatchStatus, ICertificateBatch, ICertificateProgress } from '@commudle/shared-models';
import { CertificateBatchService } from '@commudle/shared-services';
import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { Subject, interval, takeUntil } from 'rxjs';
import {
  CertificateDeliveryFunnelComponent,
  ICertificateDeliveryFunnelSegment,
} from '../certificate-delivery-funnel/certificate-delivery-funnel.component';
import { openCertificateConfirmDialog } from '../certificate-confirm-dialog/certificate-confirm-dialog.component';

const POLL_INTERVAL_MS = 4000;

@Component({
  selector: 'commudle-certificate-send-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CommudleButtonModule,
    NbCheckboxModule,
    NbInputModule,
    SharedComponentsModule,
    CertificateDeliveryFunnelComponent,
  ],
  templateUrl: './certificate-send-panel.component.html',
  styleUrls: ['./certificate-send-panel.component.scss'],
})
export class CertificateSendPanelComponent implements OnChanges, OnDestroy {
  @Input() batch: ICertificateBatch;
  @Output() batchUpdated = new EventEmitter<ICertificateBatch>();

  ECertificateBatchStatus = ECertificateBatchStatus;
  consentChecked = false;
  isSending = false;
  isIssuing = false;
  isResendingUnsentOnly = false;
  isLoadingProgress = false;
  progress: ICertificateProgress | null = null;
  emailSubject = '';
  emailBody = '';

  private destroy$ = new Subject<void>();
  private pollDestroy$ = new Subject<void>();

  constructor(
    private certificateBatchService: CertificateBatchService,
    private toastLogService: LibToastLogService,
    private dialogService: NbDialogService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.batch && this.batch) {
      if (changes.batch.firstChange) {
        this.emailSubject = this.batch.email_subject || '';
        this.emailBody = this.batch.email_body || '';
      }
      if (this.batch.status !== ECertificateBatchStatus.DRAFT) {
        this.fetchProgress();
      }
      this.togglePolling();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.pollDestroy$.next();
    this.pollDestroy$.complete();
  }

  get canSend(): boolean {
    return (
      !!this.batch?.design &&
      this.consentChecked &&
      !!this.emailSubject.trim() &&
      !!this.emailBody.trim() &&
      !this.isSending
    );
  }

  get isRevoked(): boolean {
    return !!this.batch?.revoked_at;
  }

  get headlineSegments(): ICertificateDeliveryFunnelSegment[] {
    if (!this.progress) {
      return [];
    }
    return [
      { label: 'Delivered', value: this.progress.totals.delivered, colorClass: 'com-bg-green-600' },
      { label: '', value: this.progress.totals.blocked, colorClass: 'com-bg-red-600' },
    ];
  }

  get metricSegments(): ICertificateDeliveryFunnelSegment[] {
    if (!this.progress) {
      return [];
    }
    return [
      { label: 'Sent', value: this.progress.totals.sent, colorClass: 'com-bg-Ultramarine-Blue' },
      { label: 'Delivered', value: this.progress.totals.delivered, colorClass: 'com-bg-green-600' },
      { label: 'Opened', value: this.progress.totals.opened, colorClass: 'com-bg-yellow-600' },
      { label: 'Clicked', value: this.progress.totals.clicked, colorClass: 'com-bg-purple-600' },
    ];
  }

  get legendSegments(): ICertificateDeliveryFunnelSegment[] {
    if (!this.progress) {
      return [];
    }
    return [
      { label: 'blocked', value: this.progress.totals.blocked, colorClass: 'com-bg-red-600' },
      { label: 'skipped', value: this.progress.totals.skipped, colorClass: 'com-bg-gray-400' },
    ];
  }

  fetchProgress() {
    this.isLoadingProgress = true;
    this.certificateBatchService
      .getProgress(this.batch.uuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (progress) => {
          this.progress = progress;
          this.isLoadingProgress = false;
        },
        error: () => {
          this.isLoadingProgress = false;
        },
      });
  }

  private togglePolling() {
    this.pollDestroy$.next();
    if (this.batch.status === ECertificateBatchStatus.SENDING) {
      interval(POLL_INTERVAL_MS)
        .pipe(takeUntil(this.pollDestroy$), takeUntil(this.destroy$))
        .subscribe(() => this.refreshBatchAndProgress());
    }
  }

  private refreshBatchAndProgress() {
    this.certificateBatchService
      .fetchCertificateBatch(this.batch.uuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe((freshBatch) => {
        // Mutate in place (same object reference) rather than emitting a new
        // object - sibling sections bind [batch]="batch" too, and a new
        // reference re-fires their ngOnChanges, causing a full refetch/flash
        // in every section on every poll tick. Mutating keeps this panel's
        // own bindings live without disturbing anything else.
        Object.assign(this.batch, freshBatch);
        this.batchUpdated.emit(this.batch);
        // Mutating doesn't re-fire ngOnChanges, so re-check here whether
        // polling should stop now that status may have moved past SENDING.
        this.togglePolling();
      });
    this.fetchProgress();
  }

  issueCertificates() {
    if (!this.batch?.design || this.isIssuing) {
      return;
    }
    this.isIssuing = true;
    this.certificateBatchService
      .issueBatch(this.batch.uuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isIssuing = false;
          this.toastLogService.successDialog('Issuing certificates - this runs in the background.');
        },
        error: (err) => {
          this.isIssuing = false;
          this.toastLogService.errorDialog(err?.error?.message || 'Could not start issuing certificates');
        },
      });
  }

  send() {
    if (!this.canSend) {
      return;
    }
    this.isSending = true;
    this.certificateBatchService
      .updateCertificateBatch(this.batch.uuid, {
        email_subject: this.emailSubject.trim(),
        email_body: this.emailBody.trim(),
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          Object.assign(this.batch, updated);
          this.certificateBatchService
            .sendBatch(this.batch.uuid)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.isSending = false;
                this.toastLogService.successDialog('Sending started');
                this.refreshBatchAndProgress();
              },
              error: (err) => {
                this.isSending = false;
                this.toastLogService.errorDialog(err?.error?.message || 'Could not start sending');
              },
            });
        },
        error: () => {
          this.isSending = false;
          this.toastLogService.errorDialog('Could not save the email subject/body before sending');
        },
      });
  }

  resend() {
    openCertificateConfirmDialog(this.dialogService, {
      message: 'Resend this batch? This re-emails every non-revoked recipient.',
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.isSending = true;
        this.certificateBatchService
          .resendBatch(this.batch.uuid)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.isSending = false;
              this.toastLogService.successDialog('Resending started');
              this.refreshBatchAndProgress();
            },
            error: (err) => {
              this.isSending = false;
              this.toastLogService.errorDialog(err?.error?.message || 'Could not resend');
            },
          });
      });
  }

  resendUnsentOnly() {
    openCertificateConfirmDialog(this.dialogService, {
      message: 'Resend only to recipients who have not received a certificate yet?',
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.isResendingUnsentOnly = true;
        this.certificateBatchService
          .resendBatch(this.batch.uuid, { unsent_only: true })
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.isResendingUnsentOnly = false;
              this.toastLogService.successDialog('Resending to unsent recipients started');
              this.refreshBatchAndProgress();
            },
            error: (err) => {
              this.isResendingUnsentOnly = false;
              this.toastLogService.errorDialog(err?.error?.message || 'Could not resend');
            },
          });
      });
  }

  toggleRevoke() {
    const message = this.isRevoked
      ? 'Un-revoke this batch? All its certificates become publicly viewable again.'
      : 'Revoke this whole batch? Every certificate in it 404s on its public page until un-revoked.';
    openCertificateConfirmDialog(this.dialogService, { message })
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        const action = this.isRevoked
          ? this.certificateBatchService.unrevokeBatch(this.batch.uuid)
          : this.certificateBatchService.revokeBatch(this.batch.uuid);
        action.pipe(takeUntil(this.destroy$)).subscribe({
          next: (batch) => {
            this.toastLogService.successDialog(this.isRevoked ? 'Un-revoked' : 'Revoked');
            this.batchUpdated.emit(batch);
          },
          error: () => {
            this.toastLogService.errorDialog('Could not update the revoke status');
          },
        });
      });
  }
}
