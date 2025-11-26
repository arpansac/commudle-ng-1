import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IForum } from '@commudle/shared-models';
import { API_ROUTES, BaseApiService } from '@commudle/shared-services';
import { CommunityChannelHandlerService } from '@commudle/shared-components';

@Injectable({
  providedIn: 'root',
})
export class ForumDiscussionResolver implements Resolve<IForum> {
  constructor(
    private http: HttpClient,
    private baseApiService: BaseApiService,
    private readonly communityChannelHandlerService: CommunityChannelHandlerService,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IForum> {
    const topicSlug = route.params['topic_slug'];
    const params = new HttpParams().set('community_channel_id', topicSlug);

    return this.http
      .get<IForum>(this.baseApiService.getRoute(API_ROUTES.COMMUNITY_CHANNELS.SHOW), {
        params,
      })
      .pipe(
        tap((forum: IForum) => {
          if (forum.discussion_id && !this.communityChannelHandlerService.CommunityChannelChatChannel) {
            this.communityChannelHandlerService.init(forum.discussion_id, 'channels');
          }
        }),
      );
  }
}
