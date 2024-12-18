import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiRoutesService } from 'apps/shared-services/api-routes.service';
import { IQuestionTypes } from 'apps/shared-models/question_types.model';
import { API_ROUTES } from 'apps/shared-services/api-routes.constants';
import { Observable } from 'rxjs';
import { IDiscussionFollower } from 'apps/shared-models/discussion-follower.model';
import { IDiscussion } from 'apps/shared-models/discussion.model';
import { IPaginationCount } from '@commudle/shared-models';

@Injectable({
  providedIn: 'root',
})
export class SDiscussionsService {
  constructor(private http: HttpClient, private apiRoutesService: ApiRoutesService) {}

  getPersonalChat(discussionId): Observable<IDiscussion> {
    let params = new HttpParams().set('discussion_id', discussionId);
    return this.http.get<IDiscussion>(this.apiRoutesService.getRoute(API_ROUTES.DISCUSSIONS.GET_PERSONAL_CHAT), {
      params,
    });
  }

  getPersonalChats(page: number, count: number): Observable<IPaginationCount<IDiscussionFollower>> {
    const params = new HttpParams().set('page', page).set('count', count);
    return this.http.get<IPaginationCount<IDiscussionFollower>>(
      this.apiRoutesService.getRoute(API_ROUTES.DISCUSSIONS.GET_PERSONAL_CHATS),
      { params },
    );
  }

  getOrCreatePersonalChat(followerIds): Observable<IDiscussionFollower> {
    let params = new HttpParams({
      fromObject: { 'follower_ids[]': followerIds },
    });
    return this.http.get<IDiscussionFollower>(
      this.apiRoutesService.getRoute(API_ROUTES.DISCUSSIONS.GET_OR_CREATE_PERSONAL_CHAT),
      { params },
    );
  }
}
