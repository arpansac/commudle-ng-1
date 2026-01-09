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

  indexTeamsByRound(roundId: string | number): Observable<IHackathonTeam[]> {
    const params = new HttpParams().set('round_id', roundId);
    return this.http.get<IHackathonTeam[]>(this.apiRoutesService.getRoute(API_ROUTES.HACKATHONS.TEAMS.TEAMS_BY_ROUND), {
      params,
    });
  }
}
