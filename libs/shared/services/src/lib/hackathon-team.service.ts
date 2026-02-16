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

  bulkRegistrationStatus(
    hackathonId: string,
    newRegistrationStatus: string, // which we have to update to
    search?: string,
    roundId?: number,
    registrationStatus?: string,
    onlyWinners?: boolean,
    trackId?: number,
    problemStatementId?: number,
    offlineInviteStatusFilter?: string,
  ): Observable<any> {
    let params = new HttpParams()
      .set('hackathon_id', hackathonId)
      .set('new_registration_status', newRegistrationStatus);
    if (search) {
      params = params.set('q', search);
    }
    if (roundId) {
      params = params.set('round_id', roundId);
    }
    if (registrationStatus) {
      params = params.set('registration_status', registrationStatus);
    }
    if (onlyWinners) {
      params = params.set('only_winners', onlyWinners);
    }
    if (trackId) {
      params = params.set('track_id', trackId);
    }
    if (problemStatementId) {
      params = params.set('problem_statement_id', problemStatementId);
    }
    if (offlineInviteStatusFilter) {
      params = params.set('offline_invite_status_filter', offlineInviteStatusFilter);
    }
    return this.http.put(
      this.apiRoutesService.getRoute(API_ROUTES.HACKATHONS.TEAMS.BULK_REGISTRATION_STATUS),
      {},
      { params },
    );
  }

  bulkUpdateInviteStatus(
    hackathonId: string,
    newOfflineInviteStatus: string,
    search?: string,
    roundId?: number,
    registrationStatus?: string,
    onlyWinners?: boolean,
    trackId?: number,
    problemStatementId?: number,
    offlineInviteStatus?: string,
  ): Observable<any> {
    let params = new HttpParams()
      .set('hackathon_id', hackathonId)
      .set('new_offline_invite_status', newOfflineInviteStatus);

    if (search) {
      params = params.set('q', search);
    }
    if (roundId) {
      params = params.set('round_id', roundId);
    }
    if (registrationStatus) {
      params = params.set('registration_status', registrationStatus);
    }
    if (onlyWinners) {
      params = params.set('only_winners', onlyWinners);
    }
    if (trackId) {
      params = params.set('track_id', trackId);
    }
    if (problemStatementId) {
      params = params.set('problem_statement_id', problemStatementId);
    }
    if (offlineInviteStatus) {
      params = params.set('offline_invite_status', offlineInviteStatus);
    }
    return this.http.put(
      this.apiRoutesService.getRoute(API_ROUTES.HACKATHONS.TEAMS.BULK_UPDATE_INVITE_STATUS),
      {},
      { params },
    );
  }

  bulkUpdateRound(
    hackathonId: string,
    newRoundId: number,
    search?: string,
    roundId?: number,
    registrationStatus?: string,
    onlyWinners?: boolean,
    trackId?: number,
    problemStatementId?: number,
    offlineInviteStatusFilter?: string,
  ): Observable<any> {
    let params = new HttpParams().set('hackathon_id', hackathonId).set('new_round_id', newRoundId);
    if (search) {
      params = params.set('q', search);
    }
    if (roundId) {
      params = params.set('round_id', roundId);
    }
    if (registrationStatus) {
      params = params.set('registration_status', registrationStatus);
    }
    if (onlyWinners) {
      params = params.set('only_winners', onlyWinners);
    }
    if (trackId) {
      params = params.set('track_id', trackId);
    }
    if (problemStatementId) {
      params = params.set('problem_statement_id', problemStatementId);
    }
    if (offlineInviteStatusFilter) {
      params = params.set('offline_invite_status_filter', offlineInviteStatusFilter);
    }
    return this.http.put(this.apiRoutesService.getRoute(API_ROUTES.HACKATHONS.TEAMS.BULK_UPDATE_ROUND), {}, { params });
  }

  bulkUpdateTrack(
    hackathonId: string,
    hackathonTrackId: number,
    search?: string,
    roundId?: number,
    registrationStatus?: string,
    onlyWinners?: boolean,
    trackId?: number,
    problemStatementId?: number,
    offlineInviteStatusFilter?: string,
  ): Observable<any> {
    let params = new HttpParams().set('hackathon_id', hackathonId).set('hackathon_track_id', hackathonTrackId);
    if (search) {
      params = params.set('q', search);
    }
    if (roundId) {
      params = params.set('round_id', roundId);
    }
    if (registrationStatus) {
      params = params.set('registration_status', registrationStatus);
    }
    if (onlyWinners) {
      params = params.set('only_winners', onlyWinners);
    }
    if (trackId) {
      params = params.set('track_id', trackId);
    }
    if (problemStatementId) {
      params = params.set('problem_statement_id', problemStatementId);
    }
    if (offlineInviteStatusFilter) {
      params = params.set('offline_invite_status_filter', offlineInviteStatusFilter);
    }
    return this.http.put(this.apiRoutesService.getRoute(API_ROUTES.HACKATHONS.TEAMS.BULK_UPDATE_TRACK), {}, { params });
  }

  bulkUpdateProblemStatement(
    hackathonId: string,
    newHackathonProblemStatementId: number,
    search?: string,
    roundId?: number,
    registrationStatus?: string,
    onlyWinners?: boolean,
    trackId?: number,
    problemStatementId?: number,
    offlineInviteStatusFilter?: string,
  ): Observable<any> {
    let params = new HttpParams()
      .set('hackathon_id', hackathonId)
      .set('new_hackathon_problem_statement_id', newHackathonProblemStatementId);
    if (search) {
      params = params.set('q', search);
    }
    if (roundId) {
      params = params.set('round_id', roundId);
    }
    if (registrationStatus) {
      params = params.set('registration_status', registrationStatus);
    }
    if (onlyWinners) {
      params = params.set('only_winners', onlyWinners);
    }
    if (trackId) {
      params = params.set('track_id', trackId);
    }
    if (problemStatementId) {
      params = params.set('problem_statement_id', problemStatementId);
    }
    if (offlineInviteStatusFilter) {
      params = params.set('offline_invite_status_filter', offlineInviteStatusFilter);
    }
    return this.http.put(
      this.apiRoutesService.getRoute(API_ROUTES.HACKATHONS.TEAMS.BULK_UPDATE_PROBLEM_STATEMENT),
      {},
      { params },
    );
  }
}
