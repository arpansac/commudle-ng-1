import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IForum } from '@commudle/shared-models';
import { ForumsStore } from 'apps/commudle-admin/src/app/feature-modules/forums/store/forums.store';
import { NbDialogService } from '@commudle/theme';
import { ForumFormComponent } from 'apps/commudle-admin/src/app/feature-modules/forums/components/forum-form/forum-form.component';
import { faPlus, faArrowRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'commudle-forums-categories',
  templateUrl: './forums-categories.component.html',
  styleUrls: ['./forums-categories.component.scss'],
})
export class ForumsCategoriesComponent implements OnInit {
  forums$: Observable<IForum[]>;
  showNewTopicForm = false;
  icons = {
    faPlus,
    faArrowRight,
  };

  constructor(private forumsStore: ForumsStore, private dialogService: NbDialogService) {}

  ngOnInit() {
    this.forums$ = this.forumsStore.forums$;
    this.forumsStore.forumsByGroup$.subscribe((data) => {
      console.log('🚀 ~ ForumsCategoriesComponent ~ ngOnInit ~ data:', data);
    });
  }

  openDialogBox() {
    this.dialogService.open(ForumFormComponent);
  }
}
