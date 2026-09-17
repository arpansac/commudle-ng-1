import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NbBadgeModule } from '@commudle/theme';
import { CommudleCardModule } from '@commudle/commudle-theme';
import { ECertificateBatchStatus, ICertificateBatch } from '@commudle/shared-models';
import { CertificateBatchService } from '@commudle/shared-services';
import * as moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { CertificateDesignPickerComponent } from '../certificate-design-picker/certificate-design-picker.component';
import { CertificateRecipientsTableComponent } from '../certificate-recipients-table/certificate-recipients-table.component';
import { CertificateVariablesPanelComponent } from '../certificate-variables-panel/certificate-variables-panel.component';
import { CertificateCanvasComponent } from '../certificate-canvas/certificate-canvas.component';
import { CertificateSendPanelComponent } from '../certificate-send-panel/certificate-send-panel.component';

@Component({
  selector: 'commudle-certificate-batch-detail',
  standalone: true,
  imports: [
    CommonModule,
    CommudleCardModule,
    NbBadgeModule,
    SharedComponentsModule,
    CertificateDesignPickerComponent,
    CertificateRecipientsTableComponent,
    CertificateVariablesPanelComponent,
    CertificateCanvasComponent,
    CertificateSendPanelComponent,
  ],
  templateUrl: './certificate-batch-detail.component.html',
  styleUrls: ['./certificate-batch-detail.component.scss'],
})
export class CertificateBatchDetailComponent implements OnInit, OnDestroy {
  batch: ICertificateBatch;
  isLoading = true;
  moment = moment;
  ECertificateBatchStatus = ECertificateBatchStatus;

  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private certificateBatchService: CertificateBatchService) {}

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

  onBatchUpdated(batch: ICertificateBatch) {
    this.batch = batch;
  }

  onVariablesChanged() {
    // New reference so the recipients table's ngOnChanges re-fires and refetches its variable columns.
    this.batch = { ...this.batch };
  }
}
