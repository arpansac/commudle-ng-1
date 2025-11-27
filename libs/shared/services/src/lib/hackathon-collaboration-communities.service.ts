import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { API_ROUTES } from './api-routes.constant';
import { IHackathonCollaborationCommunity } from '@commudle/shared-models';

@Injectable({
  providedIn: 'root',
})
export class HackathonCollaborationCommunitiesService {
  constructor(private http: HttpClient, private baseApiService: BaseApiService) {}

  get(hackathonId): Observable<IHackathonCollaborationCommunity[]> {
    const params = new HttpParams().set('hackathon_id', hackathonId);
    return this.http.get<IHackathonCollaborationCommunity[]>(
      this.baseApiService.getRoute(API_ROUTES.HACKATHON_COLLABORATION_COMMUNITIES.INDEX),
      { params },
    );
  }

  create(hackathonId, communityId): Observable<IHackathonCollaborationCommunity> {
    return this.http.post<IHackathonCollaborationCommunity>(
      this.baseApiService.getRoute(API_ROUTES.HACKATHON_COLLABORATION_COMMUNITIES.CREATE),
      {
        hackathon_id: hackathonId,
        community_id: communityId,
      },
    );
  }

  destroy(hackathonCollaborationCommunityId): Observable<boolean> {
    const params = new HttpParams().set('hackathon_collaboration_community_id', hackathonCollaborationCommunityId);
    return this.http.delete<boolean>(
      this.baseApiService.getRoute(API_ROUTES.HACKATHON_COLLABORATION_COMMUNITIES.DELETE),
      {
        params,
      },
    );
  }

  resendInvitationMail(hackathonCollaborationCommunityId): Observable<boolean> {
    const params = new HttpParams().set('hackathon_collaboration_community_id', hackathonCollaborationCommunityId);

    return this.http.get<boolean>(
      this.baseApiService.getRoute(API_ROUTES.HACKATHON_COLLABORATION_COMMUNITIES.RESEND_INVITATION),
      { params },
    );
  }

  updateStatus(token, status): Observable<IHackathonCollaborationCommunity> {
    return this.http.put<IHackathonCollaborationCommunity>(
      this.baseApiService.getRoute(API_ROUTES.HACKATHON_COLLABORATION_COMMUNITIES.UPDATE_STATUS),
      {
        token,
        status,
      },
    );
  }

  pGet(hackathonId): Observable<IHackathonCollaborationCommunity[]> {
    const params = new HttpParams().set('hackathon_id', hackathonId);
    return this.http.get<IHackathonCollaborationCommunity[]>(
      this.baseApiService.getRoute(API_ROUTES.HACKATHON_COLLABORATION_COMMUNITIES.PUBLIC_INDEX),
      { params },
    );
  }
}
