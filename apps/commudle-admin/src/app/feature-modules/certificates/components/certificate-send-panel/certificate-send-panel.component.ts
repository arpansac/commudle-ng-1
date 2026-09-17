import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NbCheckboxModule } from '@commudle/theme';
import { CommudleButtonModule } from '@commudle/commudle-theme';
import { ECertificateBatchStatus, ICertificateBatch, ICertificateProgress } from '@commudle/shared-models';
import { CertificateBatchService } from '@commudle/shared-services';
import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { Subject, interval, takeUntil } from 'rxjs';

const POLL_INTERVAL_MS = 4000;

@Component({
  selector: 'commudle-certificate-send-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, CommudleButtonModule, NbCheckboxModule, SharedComponentsModule],
  templateUrl: './certificate-send-panel.component.html',
  styleUrls: ['./certificate-send-panel.component.scss'],
})
export class CertificateSendPanelComponent implements OnChanges, OnDestroy {
  @Input() batch: ICertificateBatch;
  @Output() batchUpdated = new EventEmitter<ICertificateBatch>();

  ECertificateBatchStatus = ECertificateBatchStatus;
  consentChecked = false;
  isSending = false;
  isLoadingProgress = false;
  progress: ICertificateProgress | null = null;

  private destroy$ = new Subject<void>();
  private pollDestroy$ = new Subject<void>();

  constructor(private certificateBatchService: CertificateBatchService, private toastLogService: LibToastLogService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.batch && this.batch) {
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
    return !!this.batch?.design && this.consentChecked && !this.isSending;
  }

  get isRevoked(): boolean {
    return !!this.batch?.revoked_at;
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

  send() {
    if (!this.canSend) {
      return;
    }
    this.isSending = true;
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
  }

  resend() {
    if (!confirm('Resend this batch? This re-emails every non-revoked recipient.')) {
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
  }

  toggleRevoke() {
    const action = this.isRevoked
      ? this.certificateBatchService.unrevokeBatch(this.batch.uuid)
      : this.certificateBatchService.revokeBatch(this.batch.uuid);
    const confirmMessage = this.isRevoked
      ? 'Un-revoke this batch? All its certificates become publicly viewable again.'
      : 'Revoke this whole batch? Every certificate in it 404s on its public page until un-revoked.';
    if (!confirm(confirmMessage)) {
      return;
    }
    action.pipe(takeUntil(this.destroy$)).subscribe({
      next: (batch) => {
        this.toastLogService.successDialog(this.isRevoked ? 'Un-revoked' : 'Revoked');
        this.batchUpdated.emit(batch);
      },
      error: () => {
        this.toastLogService.errorDialog('Could not update the revoke status');
      },
    });
  }
}
