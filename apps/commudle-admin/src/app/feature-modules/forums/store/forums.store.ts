import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IForum, IPagination, EDbModels, IChannelCategory } from '@commudle/shared-models';
import { ForumService, ToastrService } from '@commudle/shared-services';

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

  constructor(private readonly forumService: ForumService, private readonly toastrService: ToastrService) {}

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

  clearAllData(): void {
    this.forums.next([]);
    this.parentId.next(null);
    this.parentType.next(null);
    this.categories.next([]);
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
