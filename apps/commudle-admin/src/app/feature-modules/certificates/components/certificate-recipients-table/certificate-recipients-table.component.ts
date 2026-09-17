import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NbBadgeModule, NbDialogService, NbIconModule } from '@commudle/theme';
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
import { DataTableColumn, DataTableComponent, DataTableConfig, DataTableRow } from '../../../../app-shared-components/data-table/data-table.component';
import { CertificateRecipientFormDialogComponent } from '../certificate-recipient-form-dialog/certificate-recipient-form-dialog.component';
import { CertificateCsvUploadDialogComponent } from '../certificate-csv-upload-dialog/certificate-csv-upload-dialog.component';
import { CertificateRecipientPreviewDialogComponent } from '../certificate-recipient-preview-dialog/certificate-recipient-preview-dialog.component';

@Component({
  selector: 'commudle-certificate-recipients-table',
  standalone: true,
  imports: [
    CommonModule,
    CommudleButtonModule,
    NbBadgeModule,
    NbIconModule,
    FontAwesomeModule,
    SharedComponentsModule,
    DataTableComponent,
  ],
  templateUrl: './certificate-recipients-table.component.html',
  styleUrls: ['./certificate-recipients-table.component.scss'],
})
export class CertificateRecipientsTableComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() batch: ICertificateBatch;
  @Output() variablesChanged = new EventEmitter<void>();

  @ViewChild('statusCell') statusCellTemplate: TemplateRef<unknown>;
  @ViewChild('actionsCell') actionsCellTemplate: TemplateRef<unknown>;

  recipients: ICertificateRecipient[] = [];
  variables: ICertificateVariable[] = [];
  isLoading = true;
  page = 1;
  count = 10;
  total = 0;
  ECertificateRecipientStatus = ECertificateRecipientStatus;
  icons = { faPlus, faPen, faTrash, faUpload, faEye, faPaperPlane };

  tableColumns: DataTableColumn[] = [];
  tableRows: DataTableRow[] = [];
  tableConfig: DataTableConfig = { emptyMessage: 'No recipients yet.' };

  private viewInitialized = false;
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

  ngAfterViewInit() {
    this.viewInitialized = true;
    this.buildTableColumns();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buildTableColumns() {
    if (!this.viewInitialized) {
      return;
    }
    this.tableColumns = [
      { key: 'email', title: 'Email' },
      { key: 'name', title: 'Name' },
      ...this.variables.map((variable) => ({ key: `var_${variable.key}`, title: variable.label })),
      { key: 'status', title: 'Status', cellTemplate: this.statusCellTemplate },
      { key: 'actions', title: '', cellTemplate: this.actionsCellTemplate },
    ];
  }

  buildTableRows() {
    this.tableRows = this.recipients.map((recipient) => {
      const row: DataTableRow = {
        id: recipient.id,
        recipient,
        email: recipient.email,
        name: recipient.name || '-',
        status: recipient.status,
        skip_reason: recipient.skip_reason,
      };
      this.variables.forEach((variable) => {
        row[`var_${variable.key}`] = recipient.row_values?.[variable.key] || '-';
      });
      return row;
    });
  }

  fetchVariables() {
    this.certificateVariableService
      .indexCertificateVariables(this.batch.uuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.variables = res.certificate_variables.filter((v) => v.keep);
        this.buildTableColumns();
        this.buildTableRows();
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
        this.buildTableRows();
      });
  }

  onPageChange(page: number) {
    this.page = page;
    this.fetchRecipients();
  }

  statusLabel(status: ECertificateRecipientStatus): string {
    return status ?? 'unknown';
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
          this.fetchRecipients();
        },
        error: () => {
          this.toastLogService.errorDialog('Could not remove the recipient');
        },
      });
  }
}
