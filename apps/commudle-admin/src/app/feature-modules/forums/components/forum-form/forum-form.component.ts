import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Forum, ForumCategory, ForumStore } from 'apps/commudle-admin/src/app/feature-modules/forums/store/forum.store';
import { Observable } from 'rxjs';

@Component({
  selector: 'commudle-forum-form',
  templateUrl: './forum-form.component.html',
  styleUrls: ['./forum-form.component.css'],
})
export class ForumFormComponent implements OnInit {
  forumForm: FormGroup;
  categories$: Observable<ForumCategory[]>;
  loading$: Observable<boolean>;

  constructor(private fb: FormBuilder, private forumStore: ForumStore) {
    this.forumForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      categoryId: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.categories$ = this.forumStore.categories$;
    this.loading$ = this.forumStore.loading$;
  }

  onSubmit() {
    if (this.forumForm.valid) {
      const forum: Forum = {
        id: Date.now().toString(),
        ...this.forumForm.value,
        createdAt: new Date(),
        updatedAt: new Date(),
        postsCount: 0,
        isActive: true,
      };
      this.forumStore.addForum(forum);
      this.forumForm.reset();
    }
  }
}
