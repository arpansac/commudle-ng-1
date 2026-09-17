import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NbDialogRef, NbIconModule, NbInputModule } from '@commudle/theme';
import { CommudleButtonModule, CommudleCardModule } from '@commudle/commudle-theme';

@Component({
  selector: 'commudle-certificate-variable-default-value-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CommudleCardModule, CommudleButtonModule, NbInputModule, NbIconModule],
  templateUrl: './certificate-variable-default-value-dialog.component.html',
  styleUrls: ['./certificate-variable-default-value-dialog.component.scss'],
})
export class CertificateVariableDefaultValueDialogComponent implements OnInit {
  @Input() label: string;
  @Input() defaultValue: string;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: NbDialogRef<CertificateVariableDefaultValueDialogComponent>,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      default_value: [this.defaultValue || ''],
    });
  }

  save() {
    this.dialogRef.close(this.form.value.default_value);
  }

  close() {
    this.dialogRef.close();
  }
}
