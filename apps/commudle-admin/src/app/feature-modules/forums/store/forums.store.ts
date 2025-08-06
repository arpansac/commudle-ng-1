import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IForum, IPagination, EDbModels } from '@commudle/shared-models';
import { ForumService } from '@commudle/shared-services';

@Injectable({
  providedIn: 'root',
})
export class ForumsStore {
  private forums: BehaviorSubject<IForum[]> = new BehaviorSubject([]);
  public readonly forums$ = this.forums.asObservable();

  private selectedForum: BehaviorSubject<IForum> = new BehaviorSubject(null);
  public readonly selectedForum$ = this.selectedForum.asObservable();

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

  setSelectedForum(forum: IForum) {
    this.selectedForum.next(forum);
  }

  addForum(forum: IForum) {
    const currentForums = this.forums.value;
    this.forums.next([...currentForums, forum]);
  }

  updateForum(updatedForum: IForum) {
    const currentForums = this.forums.value;
    const index = currentForums.findIndex((f) => f.id === updatedForum.id);
    if (index !== -1) {
      currentForums[index] = updatedForum;
      this.forums.next([...currentForums]);
    }
  }

  removeForum(forumId: number) {
    const currentForums = this.forums.value;
    this.forums.next(currentForums.filter((f) => f.id !== forumId));
  }
}
