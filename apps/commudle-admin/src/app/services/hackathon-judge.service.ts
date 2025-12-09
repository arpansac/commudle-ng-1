import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES, BaseApiService } from '@commudle/shared-services';

import { Observable } from 'rxjs';

interface IHackathonUserRoles {
  is_judge: boolean;
  is_speaker: boolean;
  is_mentor: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class HackathonJudgeService {
  constructor(private http: HttpClient, private apiRoutesService: BaseApiService) {}

  resendJudgeInvite(HackathonJudgeId): Observable<boolean> {
    return this.http.put<boolean>(this.apiRoutesService.getRoute(API_ROUTES.HACKATHON_JUDGE.RESEND_INVITE), {
      hackathon_judge_id: HackathonJudgeId,
    });
  }

  getUserRoles(hackathonId: number): Observable<IHackathonUserRoles> {
    const params = new HttpParams().set('hackathon_id', hackathonId);
    return this.http.get<IHackathonUserRoles>(this.apiRoutesService.getRoute(API_ROUTES.HACKATHON_JUDGE.ROLES), {
      params,
    });
  }
}
