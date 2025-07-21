import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ICommunityBuild, IPaginationCount, EPublishStatus } from '@commudle/shared-models';
import { API_ROUTES, BaseApiService } from '@commudle/shared-services';

@Injectable({
  providedIn: 'root',
})
export class SysAdminCommunityBuildService {
  constructor(private http: HttpClient, private apiRoutesService: BaseApiService) {}

  getAll(page = 1, count = 10, CBStatus?: EPublishStatus): Observable<IPaginationCount<ICommunityBuild>> {
    let params = new HttpParams().set('page', page).set('count', count);

    if (CBStatus) {
      params = params.append('build_status', CBStatus);
    }

    return this.http.get<IPaginationCount<ICommunityBuild>>(
      this.apiRoutesService.getRoute(API_ROUTES.COMMUNITY_BUILDS.SYS_ADMIN.INDEX),
      {
        params,
      },
    );
  }

  updatePublishStatus(communityBuildId, publishStatus): Observable<boolean> {
    return this.http.put<boolean>(
      this.apiRoutesService.getRoute(API_ROUTES.COMMUNITY_BUILDS.SYS_ADMIN.UPDATE_PUBLISH_STATUS),
      {
        community_build_id: communityBuildId,
        publish_status: publishStatus,
      },
    );
  }
}
