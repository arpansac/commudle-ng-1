import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@commudle/theme';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'commudle-new-discussion-form',
  templateUrl: './new-discussion-form.component.html',
  styleUrls: ['./new-discussion-form.component.scss'],
})
export class NewDiscussionFormComponent implements OnInit {
  discussionForm: FormGroup;
  readonly icons = {
    faTimes,
  };

  constructor(private fb: FormBuilder, private dialogRef: NbDialogRef<NewDiscussionFormComponent>) {}

  ngOnInit(): void {
    this.discussionForm = this.fb.group({
      subject: ['', Validators.required],
      discussion: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.discussionForm.valid) {
      // Handle form submission
      this.closeDialog();
    } else {
      this.discussionForm.markAllAsTouched();
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
