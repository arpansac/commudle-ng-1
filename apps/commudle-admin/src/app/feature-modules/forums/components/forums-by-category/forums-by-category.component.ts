import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, switchMap, filter } from 'rxjs/operators';
import { IForum, EDiscussionType, IChannelCategory } from '@commudle/shared-models';
import { ForumService } from '@commudle/shared-services';
import { faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons';
import { ForumFormComponent } from 'apps/commudle-admin/src/app/feature-modules/forums/components/forum-form/forum-form.component';
import { NbDialogService } from '@commudle/theme';
import { ForumsStore } from 'apps/commudle-admin/src/app/feature-modules/forums/store/forums.store';

@Component({
  selector: 'commudle-forums-by-category',
  templateUrl: './forums-by-category.component.html',
  styleUrls: ['./forums-by-category.component.scss'],
})
export class ForumsByCategoryComponent implements OnInit, OnDestroy {
  forums: IForum[] = [];
  forumCategory: IChannelCategory;
  private readonly destroy$ = new Subject<void>();
  readonly icons = {
    faPlus,
    faArrowLeft,
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly forumsStore: ForumsStore,
    private readonly forumService: ForumService,
    private readonly dialogService: NbDialogService,
    private readonly location: Location,
  ) {}

  ngOnInit(): void {
    combineLatest([this.route.params, this.forumsStore.parentId$, this.forumsStore.parentType$])
      .pipe(
        takeUntil(this.destroy$),
        filter(([, parentId, parentType]) => !!parentId && !!parentType),
        switchMap(([params, parentId, parentType]) =>
          combineLatest([
            this.forumService.getForumsByCategory(parentId, parentType, params['slug'], EDiscussionType.FORUM),
            this.forumService.showCategory(params['slug']),
          ]),
        ),
      )
      .subscribe(([forums, categoryResponse]) => {
        this.forums = forums;
        this.forumCategory = categoryResponse;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openDialogBox(): void {
    this.dialogService.open(ForumFormComponent, {
      context: {
        displayType: EDiscussionType.FORUM,
        categoryName: this.forumCategory.name,
      },
    });
  }
  backButton(): void {
    this.location.back();
  }

  editForum(forum) {}

  deleteForum(forum) {}
}
