import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IForum } from '@commudle/shared-models';
import { ForumService } from '@commudle/shared-services';
import { faArrowLeft, faSearch, faComment, faEye } from '@fortawesome/free-solid-svg-icons';
import { NbDialogService } from '@commudle/theme';
import { NewDiscussionFormComponent } from '../new-discussion-form/new-discussion-form.component';

@Component({
  selector: 'commudle-forum-discussion',
  templateUrl: './forum-discussion.component.html',
  styleUrls: ['./forum-discussion.component.scss'],
})
export class ForumDiscussionComponent implements OnInit, OnDestroy {
  forum: IForum;
  discussionId: string;
  searchTerm = '';
  sortBy = 'Most Recent';
  discussions = [
    {
      id: 1,
      title: 'Managing Operations for DevFest and Google Cloud Community Day with 500-1500 attendees',
      description:
        'Create a Cloud Learning Log to keep track of your personal progress, connect with others who share your goal, and get feedback from your peers & mentors here.',
      author: {
        name: 'John Doe',
        avatar: 'https://via.placeholder.com/40',
      },
      postedOn: 'Nov 10, 2024, 12:30 PM',
      replies: 32,
      views: 96,
    },
  ];
  private readonly destroy$ = new Subject<void>();
  readonly icons = {
    faArrowLeft,
    faSearch,
    faComment,
    faEye,
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly forumService: ForumService,
    private readonly dialogService: NbDialogService,
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.discussionId = params['discussionId'];
      this.loadForum();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadForum(): void {
    this.forum = {
      id: 1,
      name: 'User Authentication',
      description:
        'Create a Cloud Learning Log to keep track of your personal progress, connect with others who share your goal, and get feedback from your peers & mentors here.',
    } as IForum;
  }

  startNewDiscussion(): void {
    this.dialogService.open(NewDiscussionFormComponent);
  }

  onSearch(): void {
    // Filter discussions based on search term
  }

  backToCategory(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
