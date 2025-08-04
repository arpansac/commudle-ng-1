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
}
