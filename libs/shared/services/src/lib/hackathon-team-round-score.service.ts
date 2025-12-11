import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IHackathonTeamRoundScore, IHackathonTeamWithScoreAndSubmissions } from '@commudle/shared-models';
import { BaseApiService } from './base-api.service';
import { API_ROUTES } from './api-routes.constant';
@Injectable({
  providedIn: 'root',
})
export class HackathonTeamRoundScoreService {
  constructor(private http: HttpClient, private apiRoutesService: BaseApiService) {}

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

  assignmentSummary(hackathonId: number | string): Observable<any[]> {
    const params = new HttpParams().set('hackathon_id', hackathonId);
    return this.http.get<any[]>(
      this.apiRoutesService.getRoute(API_ROUTES.HACKATHON_TEAM_ROUND_SCORES.ASSIGNMENT_SUMMARY),
      { params },
    );
  }

  submitScore(score: any, scoreId: number, hackathonId: number | string): Observable<IHackathonTeamRoundScore> {
    const params = new HttpParams().set('hackathon_team_round_score_id', scoreId).set('hackathon_id', hackathonId);
    return this.http.put<IHackathonTeamRoundScore>(
      this.apiRoutesService.getRoute(API_ROUTES.HACKATHON_TEAM_ROUND_SCORES.SUBMIT_SCORE),
      { hackathon_team_round_score: score },
      { params },
    );
  }

  unassignMentor(mentorId: number, teamId: number, roundId: number): Observable<boolean> {
    const params = new HttpParams()
      .set('hackathon_judge_id', mentorId)
      .set('hackathon_team_id', teamId)
      .set('round_id', roundId);
    return this.http.delete<boolean>(
      this.apiRoutesService.getRoute(API_ROUTES.HACKATHON_TEAM_ROUND_SCORES.UNASSIGN_MENTOR),
      {
        params,
      },
    );
  }

  getTeamsByRound(hackathonId: number | string): Observable<any[]> {
    const params = new HttpParams().set('hackathon_id', hackathonId);
    return this.http.get<any[]>(this.apiRoutesService.getRoute(API_ROUTES.HACKATHON_TEAM_ROUND_SCORES.TEAMS_BY_ROUND), {
      params,
    });
  }

  showDetails(hackathonId: number | string, roundId: number): Observable<IHackathonTeamWithScoreAndSubmissions[]> {
    const params = new HttpParams().set('hackathon_id', hackathonId).set('round_id', roundId);
    return this.http.get<IHackathonTeamWithScoreAndSubmissions[]>(
      this.apiRoutesService.getRoute(API_ROUTES.HACKATHON_TEAM_ROUND_SCORES.SHOW_DETAILS),
      { params },
    );
  }
}
