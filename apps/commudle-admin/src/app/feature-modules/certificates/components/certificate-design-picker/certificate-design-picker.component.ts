import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { NbDialogService, NbIconModule } from '@commudle/theme';
import { CommudleButtonModule } from '@commudle/commudle-theme';
import { ECertificateDesignType, ICertificateBatch, ICertificateDesign } from '@commudle/shared-models';
import { CertificateBatchService, CertificateDesignService } from '@commudle/shared-services';
import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { Subject, takeUntil } from 'rxjs';
import { CertificateUploadDesignDialogComponent } from '../certificate-upload-design-dialog/certificate-upload-design-dialog.component';

@Component({
  selector: 'commudle-certificate-design-picker',
  standalone: true,
  imports: [CommonModule, CommudleButtonModule, NbIconModule, SharedComponentsModule],
  templateUrl: './certificate-design-picker.component.html',
  styleUrls: ['./certificate-design-picker.component.scss'],
})
export class CertificateDesignPickerComponent implements OnChanges, OnDestroy {
  @Input() batch: ICertificateBatch;
  @Output() batchUpdated = new EventEmitter<ICertificateBatch>();

  designs: ICertificateDesign[] = [];
  isLoading = true;
  ECertificateDesignType = ECertificateDesignType;

  designPage = 1;
  designTotal = 0;
  readonly designPageSize = 4;

  private destroy$ = new Subject<void>();
  // The parent reassigns `batch` (a new reference, same uuid) after every
  // update - e.g. selectDesign() below emits batchUpdated right after a
  // fresh upload. Refetching the whole list on every such reassignment
  // would blow away the just-uploaded design and flash the loading
  // spinner, so this only fetches when the batch actually changes.
  private loadedBatchUuid: string;

  constructor(
    private certificateDesignService: CertificateDesignService,
    private certificateBatchService: CertificateBatchService,
    private toastLogService: LibToastLogService,
    private dialogService: NbDialogService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.batch && this.batch && this.batch.uuid !== this.loadedBatchUuid) {
      this.loadedBatchUuid = this.batch.uuid;
      this.designPage = 1;
      this.fetchDesigns();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchDesigns() {
    this.isLoading = true;
    this.certificateDesignService
      .indexCertificateDesigns(this.batch.issuer_id, 'all', this.designPage, this.designPageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.designs = res.values;
        this.designTotal = res.total;
        this.isLoading = false;
      });
  }

  onDesignPageChange(page: number) {
    this.designPage = page;
    this.fetchDesigns();
  }

  selectDesign(design: ICertificateDesign) {
    if (design.id === this.batch.design?.id) {
      return;
    }
    // A design can be swapped even after some certificates were already
    // issued under the old one - those PDFs are permanent, stored bytes
    // that never change on their own, so a swap only matters for
    // recipients if the organizer explicitly reissues them (via "Issue
    // Certificates" or the per-recipient "Reissue" button). No prompt or
    // scope choice here - just a heads-up that existing certificates
    // weren't touched by this swap.
    const hadPreviousDesign = !!this.batch.design;
    this.certificateBatchService
      .updateCertificateBatch(this.batch.uuid, { certificate_design_id: design.id })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedBatch) => {
          this.toastLogService.successDialog('Design updated');
          this.batchUpdated.emit(updatedBatch);
          if (hadPreviousDesign && (updatedBatch.sent_count > 0 || updatedBatch.generated_count > 0)) {
            this.toastLogService.warningDialog(
              'Existing issued certificates will not be changed unless you reissue them',
            );
          }
        },
        error: () => {
          this.toastLogService.errorDialog('Could not update the design');
        },
      });
  }

  openUploadDialog() {
    this.dialogService
      .open(CertificateUploadDesignDialogComponent, {
        context: { issuerId: this.batch.issuer_id, defaultName: this.batch.name },
      })
      .onClose.pipe(takeUntil(this.destroy$))
      .subscribe((design: ICertificateDesign | undefined) => {
        if (!design) {
          return;
        }
        // Prepend locally rather than refetching (see the "mutate locally,
        // don't refetch" note elsewhere in this feature) - but with real
        // server-side pagination now in place, page 1 can only ever hold
        // `designPageSize` items, so cap it the same way a fresh fetch of
        // page 1 would.
        this.designPage = 1;
        this.designs = [design, ...this.designs].slice(0, this.designPageSize);
        this.designTotal += 1;
        this.selectDesign(design);
      });
  }
}
