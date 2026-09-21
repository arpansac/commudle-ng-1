import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NbDialogRef, NbIconModule } from '@commudle/theme';
import { CommudleButtonModule, CommudleCardModule } from '@commudle/commudle-theme';

export type ECertificateReissueScope = 'all' | 'unissued';

// Shown from "Issue Certificates" when some recipients already have a
// permanently-stored certificate (possibly under a since-changed design).
// A previously-issued PDF is never touched automatically - the organizer
// has to explicitly choose who gets (re)issued. No "choose specific
// recipients" option here - there's no bulk "issue to selected" action,
// and the per-recipient "Reissue with current design" button in the
// recipients table already covers that case directly.
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
