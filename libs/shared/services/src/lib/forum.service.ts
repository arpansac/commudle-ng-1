import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { API_ROUTES } from './api-routes.constant';
import { Observable } from 'rxjs';
import { EDbModels, EDiscussionType, IForum, IPagination } from '@commudle/shared-models';

@Injectable({
  providedIn: 'root',
})
export class ForumService {
  constructor(private http: HttpClient, private baseApiService: BaseApiService) {}

  showForum(forumId: number): Observable<IForum> {
    const params = new HttpParams().set('community_channel_id', forumId);
    return this.http.get<IForum>(this.baseApiService.getRoute(API_ROUTES.COMMUNITY_CHANNELS.SHOW), {
      params,
    });
  }

  indexForums(parentId: number | string, parentType: EDbModels): Observable<IPagination<IForum[]>> {
    const params = new HttpParams()
      .set('display_type', EDiscussionType.FORUM)
      .set('limit', '50')
      .set('parent_type', parentType)
      .set('parent_id', parentId);

    return this.http.get<IPagination<IForum[]>>(this.baseApiService.getRoute(API_ROUTES.COMMUNITY_CHANNELS.INDEX), {
      params,
    });
  }
}
