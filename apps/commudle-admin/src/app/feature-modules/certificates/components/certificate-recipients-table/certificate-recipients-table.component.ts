import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { NbDialogService, NbIconModule } from '@commudle/theme';
import { CommudleButtonModule } from '@commudle/commudle-theme';
import {
  ECertificateRecipientStatus,
  ICertificateBatch,
  ICertificateRecipient,
  ICertificateVariable,
} from '@commudle/shared-models';
import { CertificateRecipientService, CertificateVariableService } from '@commudle/shared-services';
import { faPlus, faPen, faTrash, faUpload, faEye, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { Subject, takeUntil } from 'rxjs';
import { CertificateRecipientFormDialogComponent } from '../certificate-recipient-form-dialog/certificate-recipient-form-dialog.component';
import { CertificateCsvUploadDialogComponent } from '../certificate-csv-upload-dialog/certificate-csv-upload-dialog.component';
import { CertificateRecipientPreviewDialogComponent } from '../certificate-recipient-preview-dialog/certificate-recipient-preview-dialog.component';

@Component({
  selector: 'commudle-certificate-recipients-table',
  standalone: true,
  imports: [CommonModule, CommudleButtonModule, NbIconModule, FontAwesomeModule, SharedComponentsModule],
  templateUrl: './certificate-recipients-table.component.html',
  styleUrls: ['./certificate-recipients-table.component.scss'],
})
export class CertificateRecipientsTableComponent implements OnChanges, OnDestroy {
  @Input() batch: ICertificateBatch;
  @Output() variablesChanged = new EventEmitter<void>();

  recipients: ICertificateRecipient[] = [];
  variables: ICertificateVariable[] = [];
  isLoading = true;
  page = 1;
  count = 10;
  total = 0;
  ECertificateRecipientStatus = ECertificateRecipientStatus;
  icons = { faPlus, faPen, faTrash, faUpload, faEye, faPaperPlane };

  private destroy$ = new Subject<void>();

  constructor(
    private certificateRecipientService: CertificateRecipientService,
    private certificateVariableService: CertificateVariableService,
    private dialogService: NbDialogService,
    private toastLogService: LibToastLogService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.batch && this.batch) {
      this.fetchVariables();
      this.fetchRecipients();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchVariables() {
    this.certificateVariableService
      .indexCertificateVariables(this.batch.uuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.variables = res.certificate_variables;
      });
  }

  // showLoading is false for background refreshes after add/edit/delete/CSV
  // upload - toggling isLoading there would hide the whole table behind the
  // spinner (*ngIf="!isLoading") for an operation that only changed one row,
  // producing a visible flicker each time.
  fetchRecipients(showLoading = true) {
    if (showLoading) {
      this.isLoading = true;
    }
    this.certificateRecipientService
      .indexCertificateRecipients(this.batch.uuid, this.page, this.count)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.recipients = res.certificate_recipients;
        this.page = res.page;
        this.total = res.total;
        this.isLoading = false;
      });
  }

  onPageChange(page: number) {
    this.page = page;
    this.fetchRecipients();
  }

  statusLabel(status: ECertificateRecipientStatus): string {
    return status ?? 'unknown';
  }

  statusColor(status: ECertificateRecipientStatus): string {
    switch (status) {
      case ECertificateRecipientStatus.QUEUED:
      case ECertificateRecipientStatus.GENERATED:
        return 'com-bg-blue-100';
      case ECertificateRecipientStatus.SENT:
      case ECertificateRecipientStatus.DELIVERED:
        return 'com-bg-green-100';
      case ECertificateRecipientStatus.SKIPPED:
        return 'com-bg-yellow-100';
      case ECertificateRecipientStatus.BOUNCED:
      case ECertificateRecipientStatus.FAILED:
      case ECertificateRecipientStatus.BLOCKED:
        return 'com-bg-red-100';
      default:
        return 'com-bg-gray-100';
    }
  }

  statusFontColor(status: ECertificateRecipientStatus): string {
    switch (status) {
      case ECertificateRecipientStatus.QUEUED:
      case ECertificateRecipientStatus.GENERATED:
        return 'com-text-Ultramarine-Blue';
      case ECertificateRecipientStatus.SENT:
      case ECertificateRecipientStatus.DELIVERED:
        return 'com-text-green-700';
      case ECertificateRecipientStatus.SKIPPED:
        return 'com-text-yellow-700';
      case ECertificateRecipientStatus.BOUNCED:
      case ECertificateRecipientStatus.FAILED:
      case ECertificateRecipientStatus.BLOCKED:
        return 'com-text-Infra-Red';
      default:
        return 'com-text-gray-500';
    }
  }

  openAddDialog() {
    this.dialogService
      .open(CertificateRecipientFormDialogComponent, {
        context: { certificateBatchId: this.batch.uuid, variables: this.variables, recipient: null },
      })
      .onClose.pipe(takeUntil(this.destroy$))
      .subscribe((result: { recipient: ICertificateRecipient; variablesAdded: boolean } | undefined) => {
        if (result?.recipient) {
          this.fetchRecipients(false);
          if (result.variablesAdded) {
            this.fetchVariables();
            this.variablesChanged.emit();
          }
        }
      });
  }

  openEditDialog(recipient: ICertificateRecipient) {
    this.dialogService
      .open(CertificateRecipientFormDialogComponent, {
        context: { certificateBatchId: this.batch.uuid, variables: this.variables, recipient },
      })
      .onClose.pipe(takeUntil(this.destroy$))
      .subscribe((result: { recipient: ICertificateRecipient; variablesAdded: boolean } | undefined) => {
        if (result?.recipient) {
          this.fetchRecipients(false);
          if (result.variablesAdded) {
            this.fetchVariables();
            this.variablesChanged.emit();
          }
        }
      });
  }

  openCsvUploadDialog() {
    this.dialogService
      .open(CertificateCsvUploadDialogComponent, {
        context: { certificateBatchId: this.batch.uuid },
      })
      .onClose.pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.fetchVariables();
          this.fetchRecipients(false);
          this.variablesChanged.emit();
        }
      });
  }

  openPreviewDialog(recipient: ICertificateRecipient) {
    if (!this.batch.design) {
      this.toastLogService.warningDialog('Choose a design for this batch first');
      return;
    }
    this.dialogService.open(CertificateRecipientPreviewDialogComponent, {
      context: { certificateBatchId: this.batch.uuid, recipient },
    });
  }

  get canSendIndividually(): boolean {
    return !!this.batch.locked_at;
  }

  sendOne(recipient: ICertificateRecipient) {
    this.certificateRecipientService
      .sendOne(this.batch.uuid, recipient.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastLogService.successDialog(`Queued a send for ${recipient.email}`);
          this.fetchRecipients();
        },
        error: (err) => {
          this.toastLogService.errorDialog(err?.error?.message || 'Could not send to this recipient');
        },
      });
  }

  deleteRecipient(recipient: ICertificateRecipient) {
    if (!confirm(`Remove ${recipient.email} from this batch? This action cannot be undone.`)) {
      return;
    }
    this.certificateRecipientService
      .deleteCertificateRecipient(this.batch.uuid, recipient.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastLogService.successDialog('Recipient removed');
          this.fetchRecipients(false);
        },
        error: () => {
          this.toastLogService.errorDialog('Could not remove the recipient');
        },
      });
  }
}
