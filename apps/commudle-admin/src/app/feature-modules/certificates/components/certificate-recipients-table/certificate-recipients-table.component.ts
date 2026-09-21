import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NbCheckboxModule, NbDialogService, NbIconModule, NbInputModule } from '@commudle/theme';
import { CommudleButtonModule } from '@commudle/commudle-theme';
import {
  ECertificateRecipientStatus,
  ICertificateBatch,
  ICertificateRecipient,
  ICertificateVariable,
} from '@commudle/shared-models';
import {
  CertificateBatchService,
  CertificateRecipientService,
  CertificateVariableService,
} from '@commudle/shared-services';
import {
  faPlus,
  faPen,
  faTrash,
  faUpload,
  faEye,
  faPaperPlane,
  faBan,
  faCertificate,
  faDownload,
  faSpinner,
  faRedo,
  faUndo,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { Subject, debounceTime, forkJoin, takeUntil } from 'rxjs';
import { CertificateRecipientFormDialogComponent } from '../certificate-recipient-form-dialog/certificate-recipient-form-dialog.component';
import { CertificateCsvUploadDialogComponent } from '../certificate-csv-upload-dialog/certificate-csv-upload-dialog.component';
import { CertificateRecipientPreviewDialogComponent } from '../certificate-recipient-preview-dialog/certificate-recipient-preview-dialog.component';
import { openCertificateConfirmDialog } from '../certificate-confirm-dialog/certificate-confirm-dialog.component';

const ISSUED_STATUSES = [
  ECertificateRecipientStatus.GENERATED,
  ECertificateRecipientStatus.SENT,
  ECertificateRecipientStatus.DELIVERED,
];

@Component({
  selector: 'commudle-certificate-recipients-table',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CommudleButtonModule,
    NbIconModule,
    NbInputModule,
    NbCheckboxModule,
    FontAwesomeModule,
    SharedComponentsModule,
  ],
  templateUrl: './certificate-recipients-table.component.html',
  styleUrls: ['./certificate-recipients-table.component.scss'],
})
export class CertificateRecipientsTableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() batch: ICertificateBatch;
  @Output() variablesChanged = new EventEmitter<void>();

  recipients: ICertificateRecipient[] = [];
  variables: ICertificateVariable[] = [];
  isLoading = true;
  page = 1;
  count = 10;
  total = 0;
  query = '';
  searchForm: FormGroup;
  selectedIds = new Set<number>();
  isResendingSelected = false;
  isDeletingSelected = false;
  ECertificateRecipientStatus = ECertificateRecipientStatus;
  icons = {
    faPlus,
    faPen,
    faTrash,
    faUpload,
    faEye,
    faPaperPlane,
    faBan,
    faCertificate,
    faDownload,
    faSpinner,
    faRedo,
    faUndo,
  };

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private certificateRecipientService: CertificateRecipientService,
    private certificateVariableService: CertificateVariableService,
    private certificateBatchService: CertificateBatchService,
    private dialogService: NbDialogService,
    private toastLogService: LibToastLogService,
  ) {
    this.searchForm = this.fb.group({ q: [''] });
  }

  ngOnInit() {
    this.search();
  }

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

  search() {
    this.searchForm
      .get('q')
      .valueChanges.pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe((value: string) => {
        this.query = value?.trim() || '';
        this.page = 1;
        this.clearSelection();
        this.fetchRecipients(false);
      });
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
      .indexCertificateRecipients(this.batch.uuid, this.page, this.count, undefined, this.query || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.recipients = res.values;
        this.page = res.page;
        this.total = res.total;
        this.isLoading = false;
      });
  }

  onPageChange(page: number) {
    this.page = page;
    this.clearSelection();
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

  // `name` is a dual-purpose variable (see certificate-recipient-form-dialog) -
  // it's already shown via the fixed NAME column below, so it's dropped here
  // to avoid a redundant duplicate column. It still belongs in `variables`
  // itself (unfiltered) for the canvas/dialogs, where it needs to stay
  // positionable like any other variable.
  get tableVariables(): ICertificateVariable[] {
    return this.variables.filter((variable) => variable.key !== 'name');
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

  // Synchronous now - the API returns the finished recipient (status,
  // generated_at, uuid) in the response, so the row is updated in place and
  // the button swaps to "Download" immediately, without refetching the table.
  generateOne(recipient: ICertificateRecipient) {
    recipient.isGenerating = true;
    this.certificateRecipientService
      .generateOne(this.batch.uuid, recipient.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          recipient.isGenerating = false;
          Object.assign(recipient, updated);
          this.toastLogService.successDialog(`Generated a certificate for ${recipient.email}`);
        },
        error: (err) => {
          recipient.isGenerating = false;
          this.toastLogService.errorDialog(err?.error?.message || 'Could not generate this certificate');
        },
      });
  }

  // Same generate_one endpoint as generateOne() - it re-renders and
  // re-attaches the PDF unconditionally (Active Storage purges the old
  // blob on attach), so it doubles as "reissue against the current design"
  // for a recipient who was already issued under a since-changed design.
  // Confirmed first since it permanently replaces the existing certificate.
  reissueOne(recipient: ICertificateRecipient) {
    openCertificateConfirmDialog(this.dialogService, {
      message: `Reissue the certificate for ${recipient.email} using the current design? This permanently replaces their existing certificate.`,
      danger: true,
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        recipient.isGenerating = true;
        this.certificateRecipientService
          .generateOne(this.batch.uuid, recipient.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (updated) => {
              recipient.isGenerating = false;
              Object.assign(recipient, updated);
              this.toastLogService.successDialog(`Reissued the certificate for ${recipient.email}`);
            },
            error: (err) => {
              recipient.isGenerating = false;
              this.toastLogService.errorDialog(err?.error?.message || 'Could not reissue this certificate');
            },
          });
      });
  }

  // Selection is for selective resend - see resendSelected(). Cleared on
  // any page/search change since a selected id might not exist on the new
  // page, and there's no cross-page "select all" concept here.
  isSelected(recipient: ICertificateRecipient): boolean {
    return this.selectedIds.has(recipient.id);
  }

  get isAllOnPageSelected(): boolean {
    return this.recipients.length > 0 && this.recipients.every((r) => this.selectedIds.has(r.id));
  }

  toggleSelect(recipient: ICertificateRecipient, checked: boolean) {
    if (checked) {
      this.selectedIds.add(recipient.id);
    } else {
      this.selectedIds.delete(recipient.id);
    }
  }

  toggleSelectAllOnPage(checked: boolean) {
    this.recipients.forEach((r) => (checked ? this.selectedIds.add(r.id) : this.selectedIds.delete(r.id)));
  }

  clearSelection() {
    this.selectedIds.clear();
  }

  resendSelected() {
    if (this.selectedIds.size === 0) {
      return;
    }
    openCertificateConfirmDialog(this.dialogService, {
      message: `Resend to the ${this.selectedIds.size} selected recipient(s)?`,
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.isResendingSelected = true;
        this.certificateBatchService
          .resendBatch(this.batch.uuid, { recipient_ids: Array.from(this.selectedIds) })
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.isResendingSelected = false;
              this.toastLogService.successDialog('Resending to selected recipients started');
              this.clearSelection();
              this.fetchRecipients(false);
            },
            error: (err) => {
              this.isResendingSelected = false;
              this.toastLogService.errorDialog(err?.error?.message || 'Could not resend to the selected recipients');
            },
          });
      });
  }

  // No bulk-delete endpoint exists (same as revoke) - loops the existing
  // per-recipient DELETE, same pattern as resendSelected() loops send_one
  // via the batch-level recipient_ids param, just without a batch-level
  // equivalent to delegate to here.
  deleteSelected() {
    if (this.selectedIds.size === 0) {
      return;
    }
    const ids = Array.from(this.selectedIds);
    const anyIssued = this.recipients.some((r) => ids.includes(r.id) && ISSUED_STATUSES.includes(r.status));
    const message = anyIssued
      ? `Remove the ${ids.length} selected recipient(s) from this batch? This also revokes any of their already-issued certificates - they will no longer be viewable, and this cannot be undone.`
      : `Remove the ${ids.length} selected recipient(s) from this batch? This cannot be undone.`;
    openCertificateConfirmDialog(this.dialogService, { message, danger: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.isDeletingSelected = true;
        forkJoin(ids.map((id) => this.certificateRecipientService.deleteCertificateRecipient(this.batch.uuid, id)))
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.isDeletingSelected = false;
              this.toastLogService.successDialog('Selected recipients removed');
              this.clearSelection();
              this.fetchRecipients(false);
            },
            error: (err) => {
              this.isDeletingSelected = false;
              this.toastLogService.errorDialog(
                err?.error?.message || 'Could not remove some of the selected recipients',
              );
              this.clearSelection();
              this.fetchRecipients(false);
            },
          });
      });
  }

  deleteRecipient(recipient: ICertificateRecipient) {
    const message = ISSUED_STATUSES.includes(recipient.status)
      ? `Remove ${recipient.email} from this batch? This also revokes their certificate - it will no longer be viewable, and this cannot be undone.`
      : `Remove ${recipient.email} from this batch? This cannot be undone.`;
    openCertificateConfirmDialog(this.dialogService, { message, danger: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed) => {
        if (!confirmed) {
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
      });
  }

  canToggleRevoke(recipient: ICertificateRecipient): boolean {
    return !!recipient.revoked_at || ISSUED_STATUSES.includes(recipient.status);
  }

  // Once a recipient's certificate is actually issued, "Preview" (which
  // re-renders a throwaway copy every time) is misleading - it should link
  // to the real, permanently-stored one instead. Hidden if revoked too,
  // since the link would just 404.
  isIssued(recipient: ICertificateRecipient): boolean {
    return ISSUED_STATUSES.includes(recipient.status) && !recipient.revoked_at;
  }

  // Links to the public verify/view page, not the raw PDF - lets a viewer
  // see who issued it and confirm it's genuine before downloading.
  certificateViewUrl(recipient: ICertificateRecipient): string {
    return `/certificates/verify/${recipient.uuid}`;
  }

  toggleRecipientRevoke(recipient: ICertificateRecipient) {
    const isRevoked = !!recipient.revoked_at;
    const message = isRevoked
      ? `Un-revoke the certificate for ${recipient.email}? It becomes publicly viewable again.`
      : `Revoke the certificate for ${recipient.email}? Their certificate's public page 404s until un-revoked.`;
    openCertificateConfirmDialog(this.dialogService, { message })
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        const action = isRevoked
          ? this.certificateRecipientService.unrevokeCertificateRecipient(this.batch.uuid, recipient.id)
          : this.certificateRecipientService.revokeCertificateRecipient(this.batch.uuid, recipient.id);
        action.pipe(takeUntil(this.destroy$)).subscribe({
          next: (updated) => {
            recipient.revoked_at = updated.revoked_at;
            this.toastLogService.successDialog(isRevoked ? 'Un-revoked' : 'Revoked');
          },
          error: () => {
            this.toastLogService.errorDialog('Could not update the revoke status');
          },
        });
      });
  }
}
