import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@commudle/theme';
import { CommunityChannelHandlerService } from '@commudle/shared-components';
import { ToastrService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-new-discussion-form',
  templateUrl: './new-discussion-form.component.html',
  styleUrls: ['./new-discussion-form.component.scss'],
})
export class NewDiscussionFormComponent implements OnInit {
  @Input() discussionId: number;
  @Input() discussionParent: string;
  discussionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: NbDialogRef<NewDiscussionFormComponent>,
    private communityChannelHandlerService: CommunityChannelHandlerService,
    private toastrService: ToastrService,
  ) {
    this.discussionForm = this.fb.group({
      subject: ['', Validators.required],
      discussion: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.discussionForm.valid) {
      const { discussion, subject } = this.discussionForm.value;
      this.sendMessage(discussion, subject);
      this.closeDialog();
    } else {
      this.discussionForm.markAllAsTouched();
    }
  }

  private sendMessage(content: string, subject?: string): void {
    if (!this.communityChannelHandlerService.CommunityChannelChatChannel) {
      console.error('CommunityChannelChatChannel not initialized');
      this.toastrService.warningDialog('Unable to send message. Channel not connected.');
      return;
    }

    this.communityChannelHandlerService.sendForumMessage(content, subject);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
