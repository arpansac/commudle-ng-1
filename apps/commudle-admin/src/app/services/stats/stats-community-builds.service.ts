import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_ROUTES, BaseApiService } from '@commudle/shared-services';
import { ICommunityBuildStats } from '@commudle/shared-models';

@Injectable({
  providedIn: 'root',
})
export class StatsCommunityBuildsService {
  constructor(private http: HttpClient, private apiRoutesService: BaseApiService) {}

  userEngagement(communityBuildId): Observable<ICommunityBuildStats> {
    const params = new HttpParams().set('community_build_id', communityBuildId);
    return this.http.get<ICommunityBuildStats>(
      this.apiRoutesService.getRoute(API_ROUTES.STATS.COMMUNITY_BUILDS.USER_ENGAGEMENT),
      {
        params,
      },
    );
  }
}
