import { Component, Input } from '@angular/core';
import { NbDialogRef } from '@commudle/theme';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'commudle-email-preview',
  templateUrl: './email-preview.component.html',
  styleUrls: ['./email-preview.component.scss'],
})
export class EmailPreviewComponent {
  @Input() previewData: string;
  faXmark = faXmark;

  constructor(private dialogRef: NbDialogRef<EmailPreviewComponent>) {}

  closePopup() {
    this.dialogRef.close();
  }
}
