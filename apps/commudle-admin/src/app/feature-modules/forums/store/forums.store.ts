import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import {
  IForum,
  IPagination,
  IPaginationCount,
  EDbModels,
  IChannelCategory,
  IUserMessage,
  IPageInfo,
} from '@commudle/shared-models';
import { ForumService, ToastrService, DiscussionService } from '@commudle/shared-services';
import { UserMessagesService } from 'apps/commudle-admin/src/app/services/user-messages.service';

@Injectable({
  providedIn: 'root',
})
export class ForumsStore {
  private readonly forums = new BehaviorSubject<IForum[]>([]);
  readonly forums$ = this.forums.asObservable();

  private readonly parentId = new BehaviorSubject<string | null>(null);
  readonly parentId$ = this.parentId.asObservable();

  private readonly parentType = new BehaviorSubject<EDbModels | null>(null);
  readonly parentType$ = this.parentType.asObservable();

  private readonly categories = new BehaviorSubject<IChannelCategory[]>([]);
  readonly categories$ = this.categories.asObservable();

  private readonly userMessages = new BehaviorSubject<IUserMessage[]>([]);
  readonly userMessages$ = this.userMessages.asObservable();

  private readonly isLoading = new BehaviorSubject<boolean>(false);
  readonly isLoading$ = this.isLoading.asObservable();

  private readonly hasNextPage = new BehaviorSubject<boolean>(false);
  readonly hasNextPage$ = this.hasNextPage.asObservable();

  private readonly currentUserMessage = new BehaviorSubject<IUserMessage | null>(null);
  readonly currentUserMessage$ = this.currentUserMessage.asObservable();

  private readonly isLoadingUserMessage = new BehaviorSubject<boolean>(false);
  readonly isLoadingUserMessage$ = this.isLoadingUserMessage.asObservable();

  private currentPage = 1;

  constructor(
    private readonly forumService: ForumService,
    private readonly toastrService: ToastrService,
    private readonly discussionService: DiscussionService,
    private readonly userMessagesService: UserMessagesService,
  ) {}

  loadForums(parentId: string, parentType: EDbModels): void {
    this.forumService.indexForums(parentId, parentType).subscribe({
      next: (data: IPagination<IForum[]>) => {
        const forums = data.page.flatMap((item) => item.data);
        this.forums.next(forums);
      },
      error: () => this.toastrService.errorDialog('Failed to load forums'),
    });
  }

  loadCategories(parentId: string, parentType: EDbModels): void {
    this.forumService.getCategories(parentId, parentType).subscribe({
      next: (categories) => this.categories.next(categories),
      error: () => this.toastrService.errorDialog('Failed to load categories'),
    });
  }

  addForum(forum: IForum): void {
    this.forumService.createForum(forum, this.parentType.value, this.parentId.value).subscribe({
      next: (data) => {
        this.forums.next([...this.forums.value, data]);
        this.updateCategories(data);
        this.toastrService.successDialog('Forum created successfully!');
      },
      error: () => this.toastrService.errorDialog('Failed to create forum'),
    });
  }

  updateForum(updatedForum: IForum, forumId: number): void {
    this.forumService.updateForum(updatedForum, forumId).subscribe({
      next: (data) => {
        const forums = this.forums.value.map((f) => (f.id === forumId ? data : f));
        this.forums.next(forums);
        this.toastrService.successDialog('Forum updated successfully!');
      },
    });
  }

  removeForum(forumId: number): void {
    const forums = this.forums.value.filter((f) => f.id !== forumId);
    this.forums.next(forums);
    this.toastrService.successDialog('Forum deleted successfully!');
  }

  setParentContext(parentId: string, parentType: EDbModels): void {
    this.parentId.next(parentId);
    this.parentType.next(parentType);
  }

  loadDiscussions(discussionId: number, loadMore = false, count = 10): void {
    if (loadMore && (!this.hasNextPage.value || this.isLoading.value)) return;

    if (!loadMore) {
      this.currentPage = 1;
    } else {
      this.currentPage++;
    }

    this.isLoading.next(true);

    this.discussionService
      .getForumsMessages(discussionId, count, this.currentPage)
      .pipe(finalize(() => this.isLoading.next(false)))
      .subscribe((data: IPaginationCount<IUserMessage>) => {
        const currentMessages = this.userMessages.value;

        this.userMessages.next(loadMore ? [...currentMessages, ...data.values] : data.values);

        const totalPages = Math.ceil(data.total / count);
        this.hasNextPage.next(this.currentPage < totalPages);
      });
  }

  addNewMessage(message: IUserMessage): void {
    const currentMessages = this.userMessages.value;
    if (!currentMessages.find((msg) => msg.id === message.id)) {
      this.userMessages.next([message, ...currentMessages]);
    }
  }

  loadUserMessage(userMessageSlug: string): void {
    this.isLoadingUserMessage.next(true);

    this.userMessagesService
      .showUserMessage(userMessageSlug)
      .pipe(finalize(() => this.isLoadingUserMessage.next(false)))
      .subscribe({
        next: (userMessage: IUserMessage) => {
          this.currentUserMessage.next(userMessage);
        },
        error: () => {
          this.toastrService.errorDialog('Failed to load message');
          this.currentUserMessage.next(null);
        },
      });
  }

  addReplyToUserMessage(reply: IUserMessage): void {
    const currentMessage = this.currentUserMessage.value;
    if (currentMessage && !currentMessage.user_messages.find((msg) => msg.id === reply.id)) {
      const updatedMessage = {
        ...currentMessage,
        user_messages: [...currentMessage.user_messages, reply],
      };
      this.currentUserMessage.next(updatedMessage);
    }
  }

  clearUserMessage(): void {
    this.currentUserMessage.next(null);
    this.isLoadingUserMessage.next(false);
  }

  clearDiscussions(): void {
    this.userMessages.next([]);
    this.hasNextPage.next(false);
    this.currentPage = 1;
  }

  clearAllData(): void {
    this.forums.next([]);
    this.parentId.next(null);
    this.parentType.next(null);
    this.categories.next([]);
    this.clearDiscussions();
    this.clearUserMessage();
  }

  private updateCategories(forum: IForum): void {
    const categories = this.categories.value;
    const existingIndex = categories.findIndex((cat) => cat.slug === forum.channel_category.slug);

    if (existingIndex !== -1) {
      const updated = [...categories];
      updated[existingIndex] = {
        ...updated[existingIndex],
        channels_count: updated[existingIndex].channels_count + 1,
        featured_channel: updated[existingIndex].featured_channel || forum,
      };
      this.categories.next(updated);
    } else {
      const newCategory: IChannelCategory = {
        name: forum.channel_category.name,
        slug: forum.channel_category.slug,
        channels_count: 1,
        featured_channel: forum,
      };
      this.categories.next([...categories, newCategory]);
    }
  }
}
