import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IForum, IPagination, EDbModels, IChannelCategory } from '@commudle/shared-models';
import { ForumService } from '@commudle/shared-services';

@Injectable({
  providedIn: 'root',
})
export class ForumsStore {
  private forums: BehaviorSubject<IForum[]> = new BehaviorSubject([]);
  public readonly forums$ = this.forums.asObservable();

  private parentId: BehaviorSubject<string | null> = new BehaviorSubject(null);
  public readonly parentId$ = this.parentId.asObservable();

  private parentType: BehaviorSubject<EDbModels | null> = new BehaviorSubject(null);
  public readonly parentType$ = this.parentType.asObservable();

  private categories: BehaviorSubject<IChannelCategory[]> = new BehaviorSubject([]);
  public readonly categories$ = this.categories.asObservable();

  constructor(private forumService: ForumService) {}

  loadForums(parentId: string, parentType: EDbModels) {
    this.forumService.indexForums(parentId, parentType).subscribe({
      next: (data: IPagination<IForum[]>) => {
        this.forums.next(data.page.reduce((acc, value) => [...acc, value.data], []));
      },
      error: (error) => {
        console.error('Error loading forums:', error);
      },
    });
  }

  loadCategories(parentId: string, parentType: EDbModels) {
    this.forumService.getCategories(parentId, parentType).subscribe({
      next: (categories: IChannelCategory[]) => {
        this.categories.next(categories);
      },
    });
  }

  // loadForumsByCategory(parentId: string, parentType: EDbModels, categorySlug: string) {
  //   this.forumService.getForumsByCategory(parentId, parentType, categorySlug).subscribe({
  //     next: (data: IPagination<IForum[]>) => {
  //       this.forums.next(data.page.reduce((acc, value) => [...acc, value.data], []));
  //     },
  //     error: (error) => {
  //       console.error('Error loading forums by category:', error);
  //     },
  //   });
  // }

  addForum(forum: IForum) {
    this.forumService.createForum(forum, this.parentType.value, this.parentId.value).subscribe({
      next: (data: IForum) => {
        this.forums.next([...this.forums.value, data]);
      },
      error: (error) => {
        console.error('Error adding forum:', error);
      },
    });
  }

  updateForum(updatedForum: IForum, forumId: number) {
    this.forumService.updateForum(updatedForum, forumId).subscribe({
      next: (data: IForum) => {
        const currentForums = this.forums.value;
        const index = currentForums.findIndex((f) => f.id === forumId);
        if (index !== -1) {
          currentForums[index] = data;
          this.forums.next([...currentForums]);
        }
      },
      error: (error) => {
        console.error('Error updating forum:', error);
      },
    });
  }

  removeForum(forumId: number) {
    const currentForums = this.forums.value;
    this.forums.next(currentForums.filter((f) => f.id !== forumId));
  }

  setParentContext(parentId: string, parentType: EDbModels): void {
    this.parentId.next(parentId);
    this.parentType.next(parentType);
  }

  getParentId(): string | null {
    return this.parentId.value;
  }

  getParentType(): EDbModels | null {
    return this.parentType.value;
  }

  clearAllData() {
    this.forums.next([]);
    this.parentId.next(null);
    this.parentType.next(null);
    this.categories.next([]);
  }
}
