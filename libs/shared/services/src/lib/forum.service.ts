import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  EDbModels,
  EDiscussionType,
  IChannelCategory,
  IForum,
  IPagination,
  IPaginationCount,
} from '@commudle/shared-models';
import { Observable } from 'rxjs';
import { API_ROUTES } from './api-routes.constant';
import { BaseApiService } from './base-api.service';

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

  createForum(forum: IForum, parentType: EDbModels, parentId: number | string): Observable<IForum> {
    const params = new HttpParams().set('parent_type', parentType).set('parent_id', parentId);

    return this.http.post<IForum>(
      this.baseApiService.getRoute(API_ROUTES.COMMUNITY_CHANNELS.CREATE),
      { community_channel: forum },
      {
        params,
      },
    );
  }

  updateForum(forum: IForum, forumId: number): Observable<IForum> {
    const params = new HttpParams().set('community_channel_id', forumId);
    return this.http.put<IForum>(
      this.baseApiService.getRoute(API_ROUTES.COMMUNITY_CHANNELS.UPDATE),
      { community_channel: forum },
      { params },
    );
  }

  getCategories(parentId: number | string, parentType: EDbModels): Observable<IChannelCategory[]> {
    const params = new HttpParams().set('parent_id', parentId).set('parent_type', parentType);

    return this.http.get<IChannelCategory[]>(
      this.baseApiService.getRoute(API_ROUTES.COMMUNITY_CHANNELS.GET_CATEGORIES),
      {
        params,
      },
    );
  }

  getForumsByCategory(
    parentId: number | string,
    parentType: EDbModels,
    categorySlug: string,
    displayType: EDiscussionType,
    page = 1,
    count = 10,
  ): Observable<IPaginationCount<IForum>> {
    const params = new HttpParams()
      .set('display_type', displayType)
      .set('parent_type', parentType)
      .set('parent_id', parentId)
      .set('channel_category_id', categorySlug)
      .set('page', page.toString())
      .set('count', count.toString());

    return this.http.get<IPaginationCount<IForum>>(
      this.baseApiService.getRoute(API_ROUTES.COMMUNITY_CHANNELS.INDEX_BY_CATEGORY),
      {
        params,
      },
    );
  }

  showCategory(categoryId: number | string): Observable<IChannelCategory> {
    const params = new HttpParams().set('channel_category_id', categoryId);
    return this.http.get<IChannelCategory>(this.baseApiService.getRoute(API_ROUTES.COMMUNITY_CHANNELS.SHOW_CATEGORY), {
      params,
    });
  }

  deleteForum(forumId: number): Observable<boolean> {
    const params = new HttpParams().set('community_channel_id', forumId);
    return this.http.delete<boolean>(this.baseApiService.getRoute(API_ROUTES.COMMUNITY_CHANNELS.DELETE), { params });
  }
}
