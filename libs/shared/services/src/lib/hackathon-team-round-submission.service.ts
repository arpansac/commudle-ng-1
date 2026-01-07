import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IHackathonTeamRoundSubmission } from '@commudle/shared-models';
import { BaseApiService } from './base-api.service';
import { API_ROUTES } from './api-routes.constant';

@Injectable({
  providedIn: 'root',
})
export class HackathonTeamRoundSubmissionService {
  constructor(private http: HttpClient, private apiRoutesService: BaseApiService) {}

  createSubmission(
    formData: FormData,
    hackathonTeamId: number,
    roundId: number,
  ): Observable<IHackathonTeamRoundSubmission> {
    const params = new HttpParams().set('hackathon_team_id', hackathonTeamId).set('round_id', roundId);
    return this.http.post<IHackathonTeamRoundSubmission>(
      this.apiRoutesService.getRoute(API_ROUTES.HACKATHON_TEAM_ROUND_SUBMISSIONS.CREATE),
      formData,
      { params },
    );
  }

  updateSubmission(formData: FormData, submissionId: number): Observable<IHackathonTeamRoundSubmission> {
    const params = new HttpParams().set('submission_id', submissionId);
    return this.http.put<IHackathonTeamRoundSubmission>(
      this.apiRoutesService.getRoute(API_ROUTES.HACKATHON_TEAM_ROUND_SUBMISSIONS.UPDATE),
      formData,
      { params },
    );
  }
}
