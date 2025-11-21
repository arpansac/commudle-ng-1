import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, switchMap, filter } from 'rxjs/operators';
import { IForum, EDiscussionType, IChannelCategory } from '@commudle/shared-models';
import { ForumService, ToastrService } from '@commudle/shared-services';
import { faArrowLeft, faCircle, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ForumFormComponent } from 'apps/commudle-admin/src/app/feature-modules/forums/components/forum-form/forum-form.component';
import { NbDialogService } from '@commudle/theme';
import { ForumsStore } from '@commudle/shared-services';

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
    faCircle,
    faEdit,
    faTrash,
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly forumsStore: ForumsStore,
    private readonly forumService: ForumService,
    private readonly dialogService: NbDialogService,
    private readonly router: Router,
    private readonly tosterService: ToastrService,
  ) {}

  ngOnInit(): void {
    combineLatest([this.route.params, this.forumsStore.parentId$, this.forumsStore.parentType$])
      .pipe(
        takeUntil(this.destroy$),
        filter(([parentId, parentType]) => !!parentId && !!parentType),
        switchMap(([params, parentId, parentType]) =>
          combineLatest([
            this.forumService.getForumsByCategory(parentId, parentType, params['category_slug'], EDiscussionType.FORUM),
            this.forumService.showCategory(params['category_slug']),
          ]),
        ),
      )
      .subscribe(([forums, categoryResponse]) => {
        this.forums = forums;
        this.forumCategory = categoryResponse;
      });

    // Listen for forums changes in store
    this.forumsStore.forums$.pipe(takeUntil(this.destroy$)).subscribe((allForums) => {
      if (this.forumCategory) {
        const categoryForums = allForums.filter((forum) => forum.channel_category.slug === this.forumCategory.slug);

        // Update existing forums and add new ones
        const updatedForums = this.forums.map((existingForum) => {
          const updatedForum = categoryForums.find((f) => f.id === existingForum.id);
          return updatedForum || existingForum;
        });

        const newForums = categoryForums.filter(
          (forum) => !this.forums.some((existingForum) => existingForum.id === forum.id),
        );

        this.forums = [...updatedForums, ...newForums];
      }
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
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  editForum(forum: IForum): void {
    this.dialogService.open(ForumFormComponent, {
      context: {
        displayType: EDiscussionType.FORUM,
        categoryName: this.forumCategory.name,
        forumId: forum.id,
      },
    });
  }

  deleteForum(forum: IForum, index: number): void {
    if (confirm(`Are you sure you want to delete "${forum.name}"? This action cannot be undone.`)) {
      this.forumService.deleteForum(forum.id).subscribe((data) => {
        if (data) {
          this.forums.splice(index, 1);
          this.tosterService.successDialog('Forum deleted successfully');
        }
      });
    }
  }
}
