import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IHackathonTeam } from '@commudle/shared-models';
import { API_ROUTES } from './api-routes.constant';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class HackathonTeamService {
  constructor(private http: HttpClient, private apiRoutesService: BaseApiService) {}

  teamsByEvaluator(roundId: number, hackathonJudgeId: number): Observable<IHackathonTeam[]> {
    const params = new HttpParams().set('round_id', roundId).set('hackathon_judge_id', hackathonJudgeId);
    return this.http.get<IHackathonTeam[]>(
      this.apiRoutesService.getRoute(API_ROUTES.HACKATHONS.TEAMS.TEAMS_BY_EVALUATOR),
      {
        params,
      },
    );
  }

  updateTrack(teamId: number, hackathonTrackId: number): Observable<IHackathonTeam> {
    const params = new HttpParams().set('team_id', teamId).set('hackathon_track_id', hackathonTrackId);
    return this.http.post<IHackathonTeam>(
      this.apiRoutesService.getRoute(API_ROUTES.HACKATHONS.TEAMS.UPDATE_TRACK),
      {},
      { params },
    );
  }

  updateProblemStatement(teamId: number, hackathonProblemStatementId: number): Observable<IHackathonTeam> {
    const params = new HttpParams()
      .set('team_id', teamId)
      .set('hackathon_problem_statement_id', hackathonProblemStatementId);
    return this.http.post<IHackathonTeam>(
      this.apiRoutesService.getRoute(API_ROUTES.HACKATHONS.TEAMS.UPDATE_PROBLEM_STATEMENT),
      {},
      { params },
    );
  }
}
