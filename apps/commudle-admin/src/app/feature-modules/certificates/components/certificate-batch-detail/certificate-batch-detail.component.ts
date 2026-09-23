import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NbInputModule } from '@commudle/theme';
import { CommudleButtonModule, CommudleCardModule } from '@commudle/commudle-theme';
import { ECertificateBatchStatus, ICertificateBatch } from '@commudle/shared-models';
import { CertificateBatchService } from '@commudle/shared-services';
import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';
import * as moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faPen } from '@fortawesome/free-solid-svg-icons';
import { CertificateDesignPickerComponent } from '../certificate-design-picker/certificate-design-picker.component';
import { CertificateRecipientsTableComponent } from '../certificate-recipients-table/certificate-recipients-table.component';
import { CertificateCanvasComponent } from '../certificate-canvas/certificate-canvas.component';
import { CertificateSendPanelComponent } from '../certificate-send-panel/certificate-send-panel.component';

@Component({
  selector: 'commudle-certificate-batch-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CommudleCardModule,
    CommudleButtonModule,
    NbInputModule,
    SharedComponentsModule,
    FontAwesomeModule,
    CertificateDesignPickerComponent,
    CertificateRecipientsTableComponent,
    CertificateCanvasComponent,
    CertificateSendPanelComponent,
  ],
  templateUrl: './certificate-batch-detail.component.html',
  styleUrls: ['./certificate-batch-detail.component.scss'],
})
export class CertificateBatchDetailComponent implements OnInit, OnDestroy {
  @ViewChild(CertificateRecipientsTableComponent) recipientsTable: CertificateRecipientsTableComponent;
  @ViewChild(CertificateCanvasComponent) canvasComponent: CertificateCanvasComponent;

  batch: ICertificateBatch;
  isLoading = true;
  moment = moment;
  ECertificateBatchStatus = ECertificateBatchStatus;
  icons = { faArrowLeft, faPen };

  isEditingName = false;
  isSavingName = false;
  editedName = '';

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private certificateBatchService: CertificateBatchService,
    private toastLogService: LibToastLogService,
  ) {}

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const batchUuid = params.get('batch_uuid');
      this.fetchBatch(batchUuid);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchBatch(batchUuid: string) {
    this.isLoading = true;
    this.certificateBatchService
      .fetchCertificateBatch(batchUuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe((batch) => {
        this.batch = batch;
        this.isLoading = false;
      });
  }

  statusLabel(status: ECertificateBatchStatus): string {
    return status ?? 'unknown';
  }

  statusColor(status: ECertificateBatchStatus): string {
    switch (status) {
      case ECertificateBatchStatus.READY:
        return 'com-bg-blue-100';
      case ECertificateBatchStatus.SENDING:
        return 'com-bg-yellow-100';
      case ECertificateBatchStatus.SENT:
        return 'com-bg-green-100';
      default:
        return 'com-bg-gray-100';
    }
  }

  statusFontColor(status: ECertificateBatchStatus): string {
    switch (status) {
      case ECertificateBatchStatus.READY:
        return 'com-text-Ultramarine-Blue';
      case ECertificateBatchStatus.SENDING:
        return 'com-text-yellow-700';
      case ECertificateBatchStatus.SENT:
        return 'com-text-green-700';
      default:
        return 'com-text-gray-500';
    }
  }

  get progressPercent(): number {
    if (!this.batch?.recipients_count) {
      return 0;
    }
    return (this.batch.sent_count / this.batch.recipients_count) * 100;
  }

  startEditName() {
    this.editedName = this.batch.name;
    this.isEditingName = true;
  }

  cancelEditName() {
    this.isEditingName = false;
  }

  saveName() {
    const name = this.editedName?.trim();
    if (!name || name === this.batch.name) {
      this.isEditingName = false;
      return;
    }
    this.isSavingName = true;
    this.certificateBatchService
      .updateCertificateBatch(this.batch.uuid, { name })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.batch.name = updated.name;
          this.isSavingName = false;
          this.isEditingName = false;
        },
        error: () => {
          this.isSavingName = false;
          this.toastLogService.errorDialog('Could not rename the batch');
        },
      });
  }

  // Merges rather than reassigns `this.batch` - every section binds
  // [batch]="batch", so swapping the reference re-fires ngOnChanges
  // everywhere (a full recipients-table refetch/spinner flash, a canvas
  // Konva stage rebuild, etc.) even for an update as small as picking a
  // design. Centralizing the merge here means no individual emitter (design
  // picker, send panel, ...) has to remember to mutate-in-place itself -
  // whatever object they emit, it only ever gets folded into the one shared
  // instance.
  onBatchUpdated(batch: ICertificateBatch) {
    Object.assign(this.batch, batch);
  }

  onVariablesChanged() {
    // Refetch directly on the sibling components rather than replacing the
    // `batch` reference - every section binds [batch]="batch", so swapping
    // the reference re-fires ngOnChanges everywhere, causing a visible
    // flash. refreshVariablesList() (rather than fetchVariables()) avoids
    // canvas re-running initCanvas() and rebuilding the whole Konva stage
    // for a change that doesn't need it.
    this.recipientsTable?.fetchVariables();
    this.canvasComponent?.refreshVariablesList();
  }
}
