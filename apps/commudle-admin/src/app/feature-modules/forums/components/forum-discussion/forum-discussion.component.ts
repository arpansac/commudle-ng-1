import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IForum, IUserMessage, IPagination, IPageInfo } from '@commudle/shared-models';
import { DiscussionService } from '@commudle/shared-services';
import { faArrowLeft, faComment, faEye } from '@fortawesome/free-solid-svg-icons';
import { NbDialogService } from '@commudle/theme';
import { NewDiscussionFormComponent } from '../new-discussion-form/new-discussion-form.component';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';

@Component({
  selector: 'commudle-forum-discussion',
  templateUrl: './forum-discussion.component.html',
  styleUrls: ['./forum-discussion.component.scss'],
})
export class ForumDiscussionComponent implements OnInit, OnDestroy {
  forum: IForum;
  userMessages: IUserMessage[] = [];
  pageInfo: IPageInfo;
  isLoading = false;
  staticAssets = staticAssets;
  private readonly destroy$ = new Subject<void>();
  readonly icons = {
    faArrowLeft,

    faComment,
    faEye,
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly dialogService: NbDialogService,
    private readonly discussionService: DiscussionService,
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.forum = data.forum;
      this.loadDiscussions();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startNewDiscussion(): void {
    this.dialogService.open(NewDiscussionFormComponent, {
      context: {
        discussionId: this.forum.discussion_id,
        discussionParent: 'channels',
      },
    });
  }

  loadDiscussions(loadMore = false): void {
    if (loadMore && (!this.pageInfo.has_next_page || this.isLoading)) return;

    this.isLoading = true;
    const params = { limit: 10, ...(loadMore && { after: this.pageInfo.end_cursor }) };

    this.discussionService
      .getForumsMessages(this.forum.discussion_id, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: IPagination<IUserMessage>) => {
        const newDiscussions = data.page.map((item) => item.data);
        this.userMessages = loadMore ? [...this.userMessages, ...newDiscussions] : newDiscussions;
        this.pageInfo = data.page_info;
        this.isLoading = false;
      });
  }

  loadMoreDiscussions(): void {
    this.loadDiscussions(true);
  }

  backToCategory(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
