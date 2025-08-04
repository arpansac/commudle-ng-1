import { Component, OnInit } from '@angular/core';
import { ForumStore, Forum, ForumCategory } from '../store';
import { Observable } from 'rxjs';

@Component({
  selector: 'commudle-forums-categories',
  templateUrl: './forums-categories.component.html',
  styleUrls: ['./forums-categories.component.scss'],
})
export class ForumsCategoriesComponent implements OnInit {
  categories$: Observable<ForumCategory[]>;
  forums$: Observable<Forum[]>;

  constructor(private forumStore: ForumStore) {}

  ngOnInit() {
    this.categories$ = this.forumStore.categories$;
    this.forums$ = this.forumStore.forums$;
  }

  getForumsByCategory(categoryId: string): Forum[] {
    return this.forumStore.getForumsByCategory(categoryId);
  }
}
