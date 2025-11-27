import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@commudle/theme';
import { ForumsStore } from '@commudle/shared-services';
import { ForumService } from '@commudle/shared-services';
import { EDiscussionType, IForum } from '@commudle/shared-models';

@Component({
  selector: 'commudle-forum-form',
  templateUrl: './forum-form.component.html',
  styleUrls: ['./forum-form.component.scss'],
})
export class ForumFormComponent implements OnInit {
  @Input() forumId: number;
  @Input() displayType: EDiscussionType;
  @Input() categoryName = '';
  topicForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private forumsStore: ForumsStore,
    private dialogRef: NbDialogRef<ForumFormComponent>,
    private forumService: ForumService,
  ) {
    this.topicForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      group_name: ['', [Validators.required, Validators.maxLength(60)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      is_private: [false],
      is_readonly: [false],
      display_type: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.topicForm.patchValue({
      display_type: this.displayType,
      group_name: this.categoryName,
    });
    if (this.forumId) {
      this.forumService.showForum(this.forumId).subscribe({
        next: (data: IForum) => {
          this.topicForm.patchValue({
            name: data.name,
            description: data.description,
            is_private: data.is_private,
            is_readonly: data.is_readonly,
          });
        },
      });
    }
  }

  onSubmit() {
    if (this.topicForm.valid) {
      if (this.forumId) {
        this.forumsStore.updateForum(this.topicForm.value, this.forumId);
      } else {
        this.forumsStore.addForum(this.topicForm.value);
      }
      this.closeForm();
    } else {
      this.topicForm.markAllAsTouched();
    }
  }

  closeForm() {
    this.topicForm.reset();
    this.dialogRef.close();
  }
}
