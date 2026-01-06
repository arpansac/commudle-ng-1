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

  sendDashboardLink(hackathonJudgeId: number, message?: string): Observable<boolean> {
    return this.http.post<boolean>(this.apiRoutesService.getRoute(API_ROUTES.HACKATHON_JUDGE.SEND_DASHBOARD_LINK), {
      hackathon_judge_id: hackathonJudgeId,
      message,
    });
  }

  sendCustomEmail(hackathonJudgeId: number, subject: string, message: string): Observable<boolean> {
    return this.http.post<boolean>(this.apiRoutesService.getRoute(API_ROUTES.HACKATHON_JUDGE.SEND_CUSTOM_EMAIL), {
      hackathon_judge_id: hackathonJudgeId,
      subject,
      message,
    });
  }

  sendDashboardLinkToAll(hackathonId: number, message?: string): Observable<boolean> {
    return this.http.post<boolean>(this.apiRoutesService.getRoute(API_ROUTES.HACKATHON_JUDGE.SEND_DASHBOARD_LINK), {
      hackathon_id: hackathonId,
      message,
    });
  }

  sendCustomEmailToAll(hackathonId: number, subject: string, message: string): Observable<boolean> {
    return this.http.post<boolean>(this.apiRoutesService.getRoute(API_ROUTES.HACKATHON_JUDGE.SEND_CUSTOM_EMAIL), {
      hackathon_id: hackathonId,
      subject,
      message,
    });
  }

  updateMeetingUrl(hackathonJudgeId: number, meetingUrl: string): Observable<boolean> {
    return this.http.put<boolean>(this.apiRoutesService.getRoute(API_ROUTES.HACKATHON_JUDGE.UPDATE_MEETING_URL), {
      hackathon_judge_id: hackathonJudgeId,
      meeting_url: meetingUrl,
    });
  }
}
