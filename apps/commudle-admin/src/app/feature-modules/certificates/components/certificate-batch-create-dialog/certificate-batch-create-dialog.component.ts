import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NbDialogRef, NbIconModule, NbInputModule } from '@commudle/theme';
import { CommudleButtonModule, CommudleCardModule } from '@commudle/commudle-theme';
import { ICertificateBatch } from '@commudle/shared-models';
import { CertificateBatchService } from '@commudle/shared-services';
import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';

@Component({
  selector: 'commudle-certificate-batch-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CommudleCardModule,
    CommudleButtonModule,
    NbInputModule,
    NbIconModule,
    SharedComponentsModule,
  ],
  templateUrl: './certificate-batch-create-dialog.component.html',
  styleUrls: ['./certificate-batch-create-dialog.component.scss'],
})
export class CertificateBatchCreateDialogComponent implements OnInit {
  @Input() communityId: number;

  batchForm: FormGroup;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: NbDialogRef<CertificateBatchCreateDialogComponent>,
    private certificateBatchService: CertificateBatchService,
    private toastLogService: LibToastLogService,
  ) {}

  ngOnInit() {
    this.batchForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      email_subject: [''],
      email_body: [''],
    });
  }

  onSubmit() {
    if (this.batchForm.invalid) {
      this.batchForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('certificate_batch[name]', this.batchForm.value.name);
    formData.append('certificate_batch[email_subject]', this.batchForm.value.email_subject);
    formData.append('certificate_batch[email_body]', this.batchForm.value.email_body);

    this.isSaving = true;
    this.certificateBatchService.createCertificateBatch(this.communityId, formData).subscribe({
      next: (batch: ICertificateBatch) => {
        this.isSaving = false;
        this.dialogRef.close(batch);
      },
      error: () => {
        this.isSaving = false;
        this.toastLogService.errorDialog('Could not create the certificate batch');
      },
    });
  }

  close() {
    this.dialogRef.close();
  }
}
