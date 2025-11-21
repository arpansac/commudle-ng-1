import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IForum } from '@commudle/shared-models';
import { faArrowLeft, faComment, faEye, faPlus } from '@fortawesome/free-solid-svg-icons';
import { NbDialogService } from '@commudle/theme';
import { NewDiscussionFormComponent } from '../new-discussion-form/new-discussion-form.component';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';
import { ForumsStore } from '@commudle/shared-services';

@Component({
  selector: 'commudle-forum-discussion',
  templateUrl: './forum-discussion.component.html',
  styleUrls: ['./forum-discussion.component.scss'],
})
export class ForumDiscussionComponent implements OnInit, OnDestroy {
  forum: IForum;
  staticAssets = staticAssets;
  private readonly destroy$ = new Subject<void>();
  readonly icons = {
    faArrowLeft,
    faPlus,
    faComment,
    faEye,
  };

  readonly userMessages$ = this.forumsStore.userMessages$;
  readonly hasNextPage$ = this.forumsStore.hasNextPage$;
  readonly isLoading$ = this.forumsStore.isLoading$;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly dialogService: NbDialogService,
    private readonly forumsStore: ForumsStore,
  ) {}

  ngOnInit(): void {
    this.route.data.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.forum = data.forum;
      this.forumsStore.loadDiscussions(this.forum.discussion_id);
    });
  }

  ngOnDestroy(): void {
    this.forumsStore.clearDiscussions();
    this.destroy$.next();
    this.destroy$.complete();
  }

  startNewDiscussion(): void {
    this.dialogService.open(NewDiscussionFormComponent, {
      context: {
        discussionId: this.forum.discussion_id,
        discussionParent: 'forums',
      },
    });
  }

  loadMoreDiscussions(): void {
    this.forumsStore.loadDiscussions(this.forum.discussion_id, true);
  }

  backToCategory(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
