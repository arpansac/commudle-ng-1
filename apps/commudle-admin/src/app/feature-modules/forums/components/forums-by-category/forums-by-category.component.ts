import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, switchMap, filter } from 'rxjs/operators';
import { IForum, EDiscussionType, IChannelCategory, EDbModels } from '@commudle/shared-models';
import { ForumService, ToastrService } from '@commudle/shared-services';
import { faArrowLeft, faCircle, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ForumFormComponent } from 'apps/commudle-admin/src/app/feature-modules/forums/components/forum-form/forum-form.component';
import { NbDialogService } from '@commudle/theme';
import { ForumsStore } from '@commudle/shared-services';

@Component({
  standalone: false,
  selector: 'commudle-forums-by-category',
  templateUrl: './forums-by-category.component.html',
  styleUrls: ['./forums-by-category.component.scss'],
})
export class ForumsByCategoryComponent implements OnInit, OnDestroy {
  forums: IForum[] = [];
  forumCategory: IChannelCategory;
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  isLoading = true;
  isDeletingForum = false;
  private parentId: number | string;
  private parentType: EDbModels;
  private categorySlug: string;
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
    this.loadForums();
  }

  private loadForums(): void {
    combineLatest([this.route.params, this.forumsStore.parentId$, this.forumsStore.parentType$])
      .pipe(
        takeUntil(this.destroy$),
        filter(([, parentId, parentType]) => !!parentId && !!parentType),
      )
      .subscribe(([params, parentId, parentType]) => {
        this.parentId = parentId;
        this.parentType = parentType;
        this.categorySlug = params['category_slug'];
        this.getForumsByCategory();
        this.getCategoryDetails();
      });
  }

  private getForumsByCategory(): void {
    this.isLoading = true;
    this.forumService
      .getForumsByCategory(
        this.parentId,
        this.parentType,
        this.categorySlug,
        EDiscussionType.FORUM,
        this.currentPage,
        this.itemsPerPage,
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((forumsResponse) => {
        this.forums = forumsResponse.values;
        this.totalItems = forumsResponse.total;
        this.currentPage = forumsResponse.page;
        this.itemsPerPage = forumsResponse.count;
        this.isLoading = false;
      });
  }

  private getCategoryDetails(): void {
    this.forumService
      .showCategory(this.categorySlug)
      .pipe(takeUntil(this.destroy$))
      .subscribe((categoryResponse) => {
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
      this.isDeletingForum = true;
      this.forumService.deleteForum(forum.id).subscribe((data) => {
        if (data) {
          this.forums.splice(index, 1);
          this.totalItems--;
          this.tosterService.successDialog('Forum deleted successfully');
        }
        this.isDeletingForum = false;
      });
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.getForumsByCategory();
  }
}
