import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IHackathonTeamRoundScore, IBulkAssignmentResponse } from '@commudle/shared-models';
import { BaseApiService } from './base-api.service';
import { API_ROUTES } from './api-routes.constant';

@Injectable({
  providedIn: 'root',
})
export class HackathonTeamRoundScoreService {
  constructor(private http: HttpClient, private apiRoutesService: BaseApiService) {}

  bulkAssignJudges(
    hackathonJudgeIds: number[],
    hackathonTeamIds: number[],
    roundId: number,
  ): Observable<IBulkAssignmentResponse> {
    return this.http.post<IBulkAssignmentResponse>(
      this.apiRoutesService.getRoute(API_ROUTES.HACKATHON_TEAM_ROUND_SCORES.BULK_ASSIGN_JUDGES),
      {
        hackathon_judge_ids: hackathonJudgeIds,
        hackathon_team_ids: hackathonTeamIds,
        round_id: roundId,
      },
    );
  }

  assignJudge(
    hackathonJudgeId: number,
    hackathonTeamId: number,
    roundId: number,
  ): Observable<IHackathonTeamRoundScore> {
    return this.http.post<IHackathonTeamRoundScore>(
      this.apiRoutesService.getRoute(API_ROUTES.HACKATHON_TEAM_ROUND_SCORES.ASSIGN_JUDGE),
      {
        hackathon_judge_id: hackathonJudgeId,
        hackathon_team_id: hackathonTeamId,
        round_id: roundId,
      },
    );
  }

  index(hackathonId: number | string): Observable<IHackathonTeamRoundScore[]> {
    const params = new HttpParams().set('hackathon_id', hackathonId);
    return this.http.get<IHackathonTeamRoundScore[]>(
      this.apiRoutesService.getRoute(API_ROUTES.HACKATHON_TEAM_ROUND_SCORES.INDEX),
      { params },
    );
  }

  show(id: number): Observable<IHackathonTeamRoundScore> {
    const params = new HttpParams().set('id', id);
    return this.http.get<IHackathonTeamRoundScore>(
      this.apiRoutesService.getRoute(API_ROUTES.HACKATHON_TEAM_ROUND_SCORES.SHOW),
      { params },
    );
  }

  update(id: number, score: number): Observable<IHackathonTeamRoundScore> {
    const params = new HttpParams().set('id', id);
    return this.http.put<IHackathonTeamRoundScore>(
      this.apiRoutesService.getRoute(API_ROUTES.HACKATHON_TEAM_ROUND_SCORES.UPDATE),
      { score },
      { params },
    );
  }

  destroy(id: number): Observable<boolean> {
    const params = new HttpParams().set('id', id);
    return this.http.delete<boolean>(this.apiRoutesService.getRoute(API_ROUTES.HACKATHON_TEAM_ROUND_SCORES.DESTROY), {
      params,
    });
  }
}
