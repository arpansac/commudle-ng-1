import { Component, Input } from '@angular/core';
import { NbDialogRef } from '@commudle/theme';

@Component({
    selector: 'commudle-email-preview',
    templateUrl: './email-preview.component.html',
    styleUrls: ['./email-preview.component.scss'],
    standalone: false
})
export class EmailPreviewComponent {
  @Input() previewData: string;

  constructor(private dialogRef: NbDialogRef<EmailPreviewComponent>) {}

  closePopup() {
    this.dialogRef.close();
  }
}
