import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@commudle/theme';
import { ForumsStore } from 'apps/commudle-admin/src/app/feature-modules/forums/store/forums.store';

@Component({
  selector: 'commudle-forum-form',
  templateUrl: './forum-form.component.html',
  styleUrls: ['./forum-form.component.scss'],
})
export class ForumFormComponent implements OnInit {
  @Output() formClosed = new EventEmitter<void>();

  topicForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private forumsStore: ForumsStore,
    private dialogRef: NbDialogRef<ForumFormComponent>,
  ) {
    this.topicForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required],
      isPrivate: [false],
      isReadonly: [false],
    });
  }

  ngOnInit() {}

  onSubmit() {
    if (this.topicForm.valid) {
      const topicData = {
        id: Date.now(),
        name: this.topicForm.value.name,
        description: this.topicForm.value.description,
        category: this.topicForm.value.category,
        is_private: this.topicForm.value.isPrivate,
        is_readonly: this.topicForm.value.isReadonly,
        created_at: new Date(),
        posts_count: 0,
      };

      this.forumsStore.addForum(topicData as any);
      this.closeForm();
    }
  }

  addNewCategory() {
    console.log('Add new category clicked');
  }

  closeForm() {
    this.topicForm.reset();
    this.dialogRef.close();
  }
}
