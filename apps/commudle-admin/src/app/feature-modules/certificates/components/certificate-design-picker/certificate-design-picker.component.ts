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
import { NbIconModule, NbInputModule } from '@commudle/theme';
import { CommudleButtonModule } from '@commudle/commudle-theme';
import { ECertificateDesignType, ICertificateBatch, ICertificateDesign } from '@commudle/shared-models';
import { CertificateBatchService, CertificateDesignService } from '@commudle/shared-services';
import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { Subject, takeUntil } from 'rxjs';

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

  private isBrowser: boolean;
  private imageWidth: number;
  private imageHeight: number;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private certificateDesignService: CertificateDesignService,
    private certificateBatchService: CertificateBatchService,
    private toastLogService: LibToastLogService,
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

  get isLocked(): boolean {
    return !!this.batch?.locked_at;
  }

  fetchDesigns() {
    this.isLoading = true;
    this.certificateDesignService
      .indexCertificateDesigns(this.batch.issuer_id, 'all')
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.designs = res.certificate_designs;
        this.isLoading = false;
      });
  }

  selectDesign(design: ICertificateDesign) {
    if (this.isLocked || design.id === this.batch.design?.id) {
      return;
    }
    this.certificateBatchService
      .updateCertificateBatch(this.batch.uuid, { certificate_design_id: design.id })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedBatch) => {
          this.toastLogService.successDialog('Design updated');
          this.batchUpdated.emit(updatedBatch);
        },
        error: () => {
          this.toastLogService.errorDialog('Could not update the design');
        },
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
    this.selectedFilePreviewUrl = null;
  }
}
