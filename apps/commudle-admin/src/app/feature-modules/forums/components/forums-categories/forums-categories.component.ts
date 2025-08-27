import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { EDiscussionType, IChannelCategory } from '@commudle/shared-models';
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
  categories$: Observable<IChannelCategory[]>;
  showNewTopicForm = false;
  icons = {
    faPlus,
    faArrowRight,
  };

  constructor(private forumsStore: ForumsStore, private dialogService: NbDialogService) {}

  ngOnInit() {
    this.categories$ = this.forumsStore.categories$;
  }

  openDialogBox() {
    this.dialogService.open(ForumFormComponent, {
      context: {
        displayType: EDiscussionType.FORUM,
      },
    });
  }
}
