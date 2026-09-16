import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { NbBadgeModule, NbButtonModule, NbCardModule, NbDialogService, NbIconModule } from '@commudle/theme';
import {
  ECertificateRecipientStatus,
  ICertificateBatch,
  ICertificateRecipient,
  ICertificateVariable,
} from '@commudle/shared-models';
import { CertificateRecipientService, CertificateVariableService } from '@commudle/shared-services';
import { faPlus, faPen, faTrash, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { Subject, takeUntil } from 'rxjs';
import { CertificateRecipientFormDialogComponent } from '../certificate-recipient-form-dialog/certificate-recipient-form-dialog.component';
import { CertificateCsvUploadDialogComponent } from '../certificate-csv-upload-dialog/certificate-csv-upload-dialog.component';

@Component({
  selector: 'commudle-certificate-recipients-table',
  standalone: true,
  imports: [
    CommonModule,
    NbCardModule,
    NbButtonModule,
    NbBadgeModule,
    NbIconModule,
    FontAwesomeModule,
    SharedComponentsModule,
  ],
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
  icons = { faPlus, faPen, faTrash, faUpload };

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
        this.variables = res.certificate_variables.filter((v) => v.keep);
      });
  }

  fetchRecipients() {
    this.isLoading = true;
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
    return ECertificateRecipientStatus[status]?.toLowerCase() ?? 'unknown';
  }

  openAddDialog() {
    this.dialogService
      .open(CertificateRecipientFormDialogComponent, {
        context: { certificateBatchId: this.batch.uuid, variables: this.variables, recipient: null },
      })
      .onClose.pipe(takeUntil(this.destroy$))
      .subscribe((recipient) => {
        if (recipient) {
          this.fetchRecipients();
        }
      });
  }

  openEditDialog(recipient: ICertificateRecipient) {
    this.dialogService
      .open(CertificateRecipientFormDialogComponent, {
        context: { certificateBatchId: this.batch.uuid, variables: this.variables, recipient },
      })
      .onClose.pipe(takeUntil(this.destroy$))
      .subscribe((updated) => {
        if (updated) {
          this.fetchRecipients();
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
          this.fetchRecipients();
          this.variablesChanged.emit();
        }
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
          this.fetchRecipients();
        },
        error: () => {
          this.toastLogService.errorDialog('Could not remove the recipient');
        },
      });
  }
}
