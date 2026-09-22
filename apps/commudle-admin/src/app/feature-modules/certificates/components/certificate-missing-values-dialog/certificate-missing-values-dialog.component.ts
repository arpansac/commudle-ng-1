import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NbDialogRef, NbIconModule } from '@commudle/theme';
import { CommudleButtonModule, CommudleCardModule } from '@commudle/commudle-theme';
import { ICertificateMissingValuesRow } from '@commudle/shared-models';

export type ECertificateMissingValuesChoice = 'skip' | 'wait';

// Shown right before a batch Send/Resend when missingValuesPreview() finds
// recipients with a blank value and no default. "Skip and Send" closes with
// the affected ids so the caller can exclude them from recipient_ids;
// "Wait" closes with nothing so the caller can go fill the values in first.
@Component({
  selector: 'commudle-certificate-missing-values-dialog',
  standalone: true,
  imports: [CommonModule, CommudleCardModule, CommudleButtonModule, NbIconModule],
  templateUrl: './certificate-missing-values-dialog.component.html',
  styleUrls: ['./certificate-missing-values-dialog.component.scss'],
})
export class CertificateMissingValuesDialogComponent {
  @Input() rows: ICertificateMissingValuesRow[] = [];

  constructor(private dialogRef: NbDialogRef<CertificateMissingValuesDialogComponent>) {}

  missingKeysLabel(row: ICertificateMissingValuesRow): string {
    return row.missing_keys.join(', ');
  }

  skipAndSend() {
    this.dialogRef.close({ choice: 'skip', ids: this.rows.map((row) => row.id) });
  }

  wait() {
    this.dialogRef.close({ choice: 'wait' });
  }

  close() {
    this.dialogRef.close();
  }
}
