import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NbDialogRef, NbIconModule } from '@commudle/theme';
import { CommudleButtonModule, CommudleCardModule } from '@commudle/commudle-theme';

export type ECertificateReissueScope = 'all' | 'unissued' | 'specific';

// Shown after a batch's design (or variable layout) changes once some
// recipients may already have a permanently-stored certificate under the
// old design. A previously-issued PDF is never touched automatically -
// the organizer has to explicitly choose who gets re-rendered under the
// new one.
@Component({
  selector: 'commudle-certificate-reissue-dialog',
  standalone: true,
  imports: [CommonModule, CommudleCardModule, CommudleButtonModule, NbIconModule],
  templateUrl: './certificate-reissue-dialog.component.html',
  styleUrls: ['./certificate-reissue-dialog.component.scss'],
})
export class CertificateReissueDialogComponent {
  constructor(private dialogRef: NbDialogRef<CertificateReissueDialogComponent>) {}

  choose(scope: ECertificateReissueScope) {
    this.dialogRef.close(scope);
  }

  close() {
    this.dialogRef.close();
  }
}
