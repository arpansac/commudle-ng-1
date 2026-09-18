import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  PLATFORM_ID,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NbDialogService, NbIconModule, NbInputModule } from '@commudle/theme';
import { CommudleButtonModule } from '@commudle/commudle-theme';
import { ECertificateDesignType, ICertificateBatch, ICertificateDesign } from '@commudle/shared-models';
import { CertificateBatchService, CertificateDesignService } from '@commudle/shared-services';
import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { Subject, takeUntil } from 'rxjs';
import {
  CertificateReissueDialogComponent,
  ECertificateReissueScope,
} from '../certificate-reissue-dialog/certificate-reissue-dialog.component';

@Component({
  selector: 'commudle-certificate-design-picker',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CommudleButtonModule,
    NbInputModule,
    NbIconModule,
    SharedComponentsModule,
  ],
  templateUrl: './certificate-design-picker.component.html',
  styleUrls: ['./certificate-design-picker.component.scss'],
})
export class CertificateDesignPickerComponent implements OnChanges, OnDestroy {
  @Input() batch: ICertificateBatch;
  @Output() batchUpdated = new EventEmitter<ICertificateBatch>();

  designs: ICertificateDesign[] = [];
  isLoading = true;
  isSaving = false;
  showUploadForm = false;
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  selectedFilePreviewUrl: string | null = null;
  ECertificateDesignType = ECertificateDesignType;

  // The designs endpoint returns the full list in one call (no page/count
  // params in the frozen API contract), so this pages through the
  // already-fetched array client-side rather than re-fetching per page.
  designPage = 1;
  readonly designPageSize = 4;

  private isBrowser: boolean;
  private imageWidth: number;
  private imageHeight: number;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private certificateDesignService: CertificateDesignService,
    private certificateBatchService: CertificateBatchService,
    private toastLogService: LibToastLogService,
    private dialogService: NbDialogService,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.uploadForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.batch && this.batch) {
      this.fetchDesigns();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get pagedDesigns(): ICertificateDesign[] {
    const start = (this.designPage - 1) * this.designPageSize;
    return this.designs.slice(start, start + this.designPageSize);
  }

  fetchDesigns() {
    this.isLoading = true;
    this.certificateDesignService
      .indexCertificateDesigns(this.batch.issuer_id, 'all')
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.designs = res.certificate_designs;
        this.designPage = 1;
        this.isLoading = false;
      });
  }

  onDesignPageChange(page: number) {
    this.designPage = page;
  }

  selectDesign(design: ICertificateDesign) {
    if (design.id === this.batch.design?.id) {
      return;
    }
    // A design can be swapped even after some certificates were already
    // issued under the old one - those PDFs are permanent, stored bytes
    // that never change on their own, so a swap only matters for
    // recipients if the organizer explicitly asks to reissue.
    const hadPreviousDesign = !!this.batch.design;
    this.certificateBatchService
      .updateCertificateBatch(this.batch.uuid, { certificate_design_id: design.id })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedBatch) => {
          this.resetUploadForm();
          this.showUploadForm = false;
          this.toastLogService.successDialog('Design updated');
          this.batchUpdated.emit(updatedBatch);
          if (hadPreviousDesign && updatedBatch.recipients_count > 0) {
            this.promptReissue(updatedBatch);
          }
        },
        error: () => {
          this.toastLogService.errorDialog('Could not update the design');
        },
      });
  }

  private promptReissue(batch: ICertificateBatch) {
    this.dialogService
      .open(CertificateReissueDialogComponent)
      .onClose.pipe(takeUntil(this.destroy$))
      .subscribe((scope: ECertificateReissueScope | undefined) => {
        if (scope === 'all') {
          this.certificateBatchService
            .resendBatch(batch.uuid)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => this.toastLogService.successDialog('Reissuing the new design to all recipients'),
              error: (err) =>
                this.toastLogService.errorDialog(err?.error?.message || 'Could not reissue to all recipients'),
            });
        } else if (scope === 'unissued') {
          this.certificateBatchService
            .issueBatch(batch.uuid)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => this.toastLogService.successDialog('Issuing the new design to not-yet-issued recipients'),
              error: (err) =>
                this.toastLogService.errorDialog(err?.error?.message || 'Could not issue to the remaining recipients'),
            });
        } else if (scope === 'specific') {
          this.toastLogService.successDialog('Select recipients in the table below, then use "Resend to Selected"');
        }
      });
  }

  toggleUploadForm() {
    this.showUploadForm = !this.showUploadForm;
    if (!this.showUploadForm) {
      this.resetUploadForm();
    }
  }

  onFileSelected(event: Event) {
    if (!this.isBrowser) {
      return;
    }
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    if (this.selectedFilePreviewUrl) {
      URL.revokeObjectURL(this.selectedFilePreviewUrl);
    }
    this.selectedFile = file;
    this.selectedFilePreviewUrl = URL.createObjectURL(file);

    const img = new Image();
    img.onload = () => {
      this.imageWidth = img.naturalWidth;
      this.imageHeight = img.naturalHeight;
    };
    img.src = this.selectedFilePreviewUrl;
  }

  uploadDesign() {
    if (this.uploadForm.invalid || !this.selectedFile) {
      this.uploadForm.markAllAsTouched();
      if (!this.selectedFile) {
        this.toastLogService.warningDialog('Please choose a background image');
      }
      return;
    }

    const formData = new FormData();
    formData.append('certificate_design[name]', this.uploadForm.value.name);
    formData.append('certificate_design[image_width]', String(this.imageWidth));
    formData.append('certificate_design[image_height]', String(this.imageHeight));
    formData.append('background_image', this.selectedFile);

    this.isSaving = true;
    this.certificateDesignService.createCertificateDesign(this.batch.issuer_id, formData).subscribe({
      next: (design) => {
        this.isSaving = false;
        this.designs = [design, ...this.designs];
        this.designPage = 1;
        this.resetUploadForm();
        this.showUploadForm = false;
        this.selectDesign(design);
      },
      error: () => {
        this.isSaving = false;
        this.toastLogService.errorDialog('Could not upload the design');
      },
    });
  }

  private resetUploadForm() {
    this.uploadForm.reset();
    this.selectedFile = null;
    if (this.selectedFilePreviewUrl) {
      URL.revokeObjectURL(this.selectedFilePreviewUrl);
    }
    this.selectedFilePreviewUrl = null;
  }
}
