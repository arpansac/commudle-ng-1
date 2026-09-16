import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NbButtonModule, NbCardModule, NbDialogRef, NbIconModule, NbInputModule } from '@commudle/theme';
import { ICertificateRecipient, ICertificateVariable } from '@commudle/shared-models';
import { CertificateRecipientService } from '@commudle/shared-services';
import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';

@Component({
  selector: 'commudle-certificate-recipient-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NbCardModule,
    NbButtonModule,
    NbInputModule,
    NbIconModule,
    SharedComponentsModule,
  ],
  templateUrl: './certificate-recipient-form-dialog.component.html',
  styleUrls: ['./certificate-recipient-form-dialog.component.scss'],
})
export class CertificateRecipientFormDialogComponent implements OnInit {
  @Input() certificateBatchId: string;
  @Input() variables: ICertificateVariable[] = [];
  @Input() recipient: ICertificateRecipient | null = null;

  recipientForm: FormGroup;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: NbDialogRef<CertificateRecipientFormDialogComponent>,
    private certificateRecipientService: CertificateRecipientService,
    private toastLogService: LibToastLogService,
  ) {}

  get isEditMode(): boolean {
    return !!this.recipient;
  }

  ngOnInit() {
    const rowValuesGroup: { [key: string]: [string] } = {};
    this.variables.forEach((variable) => {
      rowValuesGroup[variable.key] = [this.recipient?.row_values?.[variable.key] ?? ''];
    });

    this.recipientForm = this.fb.group({
      email: [this.recipient?.email ?? '', [Validators.required, Validators.email]],
      name: [this.recipient?.name ?? ''],
      row_values: this.fb.group(rowValuesGroup),
    });

    if (this.isEditMode) {
      this.recipientForm.get('email').disable();
    }
  }

  onSubmit() {
    if (this.recipientForm.invalid) {
      this.recipientForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const formValue = this.recipientForm.getRawValue();

    const request = this.isEditMode
      ? this.certificateRecipientService.updateCertificateRecipient(this.certificateBatchId, this.recipient.id, {
          name: formValue.name,
          row_values: formValue.row_values,
        })
      : this.certificateRecipientService.createCertificateRecipient(this.certificateBatchId, {
          email: formValue.email,
          name: formValue.name,
          row_values: formValue.row_values,
        });

    request.subscribe({
      next: (recipient: ICertificateRecipient) => {
        this.isSaving = false;
        this.dialogRef.close(recipient);
      },
      error: () => {
        this.isSaving = false;
        this.toastLogService.errorDialog('Could not save the recipient');
      },
    });
  }

  close() {
    this.dialogRef.close();
  }
}
