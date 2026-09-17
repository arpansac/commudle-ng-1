import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NbDialogRef, NbIconModule, NbInputModule } from '@commudle/theme';
import { CommudleButtonModule, CommudleCardModule } from '@commudle/commudle-theme';
import { ICertificateRecipient, ICertificateVariable } from '@commudle/shared-models';
import { CertificateRecipientService, CertificateVariableService } from '@commudle/shared-services';
import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'commudle-certificate-recipient-form-dialog',
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
  templateUrl: './certificate-recipient-form-dialog.component.html',
  styleUrls: ['./certificate-recipient-form-dialog.component.scss'],
})
export class CertificateRecipientFormDialogComponent implements OnInit {
  @Input() certificateBatchId: string;
  @Input() variables: ICertificateVariable[] = [];
  @Input() recipient: ICertificateRecipient | null = null;

  recipientForm: FormGroup;
  newFields: FormArray;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: NbDialogRef<CertificateRecipientFormDialogComponent>,
    private certificateRecipientService: CertificateRecipientService,
    private certificateVariableService: CertificateVariableService,
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

    this.newFields = this.fb.array([]);
    this.recipientForm = this.fb.group({
      email: [this.recipient?.email ?? '', [Validators.required, Validators.email]],
      name: [this.recipient?.name ?? ''],
      row_values: this.fb.group(rowValuesGroup),
      newFields: this.newFields,
    });

    if (this.isEditMode) {
      this.recipientForm.get('email').disable();
    }
  }

  addField() {
    this.newFields.push(
      this.fb.group({
        label: ['', Validators.required],
        value: [''],
      }),
    );
  }

  removeField(index: number) {
    this.newFields.removeAt(index);
  }

  onSubmit() {
    if (this.recipientForm.invalid || this.newFields.invalid) {
      this.recipientForm.markAllAsTouched();
      this.newFields.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const newFieldValues = this.newFields.value as { label: string; value: string }[];
    this.createNewFields(newFieldValues).subscribe({
      next: (createdVariables) => {
        this.saveRecipient(newFieldValues, createdVariables);
      },
      error: () => {
        this.isSaving = false;
        this.toastLogService.errorDialog('Could not add the new field(s)');
      },
    });
  }

  private createNewFields(newFieldValues: { label: string; value: string }[]) {
    if (newFieldValues.length === 0) {
      return of([] as ICertificateVariable[]);
    }
    return forkJoin(
      newFieldValues.map((field) =>
        this.certificateVariableService.createCertificateVariable(this.certificateBatchId, { label: field.label }),
      ),
    );
  }

  private saveRecipient(newFieldValues: { label: string; value: string }[], createdVariables: ICertificateVariable[]) {
    const formValue = this.recipientForm.getRawValue();
    const rowValues = { ...formValue.row_values };
    createdVariables.forEach((variable, index) => {
      rowValues[variable.key] = newFieldValues[index].value;
    });

    const request = this.isEditMode
      ? this.certificateRecipientService.updateCertificateRecipient(this.certificateBatchId, this.recipient.id, {
          name: formValue.name,
          row_values: rowValues,
        })
      : this.certificateRecipientService.createCertificateRecipient(this.certificateBatchId, {
          email: formValue.email,
          name: formValue.name,
          row_values: rowValues,
        });

    request.subscribe({
      next: (recipient: ICertificateRecipient) => {
        this.isSaving = false;
        this.dialogRef.close({ recipient, variablesAdded: createdVariables.length > 0 });
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
