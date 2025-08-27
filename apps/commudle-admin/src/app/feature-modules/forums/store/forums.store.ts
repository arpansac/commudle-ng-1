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

  private forumsByGroup: BehaviorSubject<{ [groupName: string]: IForum[] }> = new BehaviorSubject({});
  public readonly forumsByGroup$ = this.forumsByGroup.asObservable();

  private selectedForum: BehaviorSubject<IForum> = new BehaviorSubject(null);
  public readonly selectedForum$ = this.selectedForum.asObservable();

  private parentId: BehaviorSubject<string | null> = new BehaviorSubject(null);
  public readonly parentId$ = this.parentId.asObservable();

  private parentType: BehaviorSubject<EDbModels | null> = new BehaviorSubject(null);
  public readonly parentType$ = this.parentType.asObservable();

  private categories: BehaviorSubject<IChannelCategory[]> = new BehaviorSubject([]);
  public readonly categories$ = this.categories.asObservable();

  constructor(private forumService: ForumService) {}

  loadForums(parentId: string, parentType: EDbModels) {
    this.parentId.next(parentId);
    this.parentType.next(parentType);

    this.forumService.indexForums(parentId, parentType).subscribe({
      next: (data: IPagination<IForum[]>) => {
        this.forums.next(data.page.reduce((acc, value) => [...acc, value.data], []));
        this.updateForumsByGroup();
      },
      error: (error) => {
        console.error('Error loading forums:', error);
      },
    });

    // this.loadCategories(parentId, parentType);
  }

  loadCategories(parentId: string, parentType: EDbModels) {
    this.forumService.getCategories(parentId, parentType).subscribe({
      next: (categories: IChannelCategory[]) => {
        this.categories.next(categories);
      },
    });
  }

  setSelectedForum(forum: IForum) {
    this.selectedForum.next(forum);
  }

  addForum(forum: IForum) {
    this.forumService.createForum(forum, this.parentType.value, this.parentId.value).subscribe({
      next: (data: IForum) => {
        this.forums.next([...this.forums.value, data]);
        this.updateForumsByGroup();
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
        this.updateForumsByGroup();
      },
      error: (error) => {
        console.error('Error updating forum:', error);
      },
    });
  }

  removeForum(forumId: number) {
    const currentForums = this.forums.value;
    this.forums.next(currentForums.filter((f) => f.id !== forumId));
    this.updateForumsByGroup();
  }

  private updateForumsByGroup() {
    const groupedForums = this.forums.value.reduce((acc, forum) => {
      const groupName = forum.group_name || 'General';
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(forum);
      return acc;
    }, {} as { [groupName: string]: IForum[] });
    this.forumsByGroup.next(groupedForums);
  }

  clearAllData() {
    this.forums.next([]);
    this.forumsByGroup.next({});
    this.selectedForum.next(null);
    this.parentId.next(null);
    this.parentType.next(null);
    this.categories.next([]);
  }
}
