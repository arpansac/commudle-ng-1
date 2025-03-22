import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiRoutesService } from 'apps/shared-services/api-routes.service';
import { API_ROUTES } from 'apps/shared-services/api-routes.constants';

@Injectable({
  providedIn: 'root',
})
export class StatsHackathonService {
  constructor(private http: HttpClient, private apiRoutesService: ApiRoutesService) {}

  genderDistribution(hackathonId: number | string): Observable<unknown> {
    const params = new HttpParams().set('hackathon_id', hackathonId);
    return this.http.get<unknown>(this.apiRoutesService.getRoute(API_ROUTES.STATS.HACKATHONS.GENDER_DISTRIBUTIONS), {
      params,
    });
  }

  hackathonTeamStats(hackathonId: number | string): Observable<unknown> {
    const params = new HttpParams().set('hackathon_id', hackathonId);
    return this.http.get<unknown>(
      this.apiRoutesService.getRoute(API_ROUTES.STATS.HACKATHONS.HACKATHON_TEAM_OVER_TIME),
      {
        params,
      },
    );
  }

  hackathonUserResponsesTags(hackathonId: number | string): Observable<unknown> {
    const params = new HttpParams().set('hackathon_id', hackathonId);
    return this.http.get<unknown>(this.apiRoutesService.getRoute(API_ROUTES.STATS.HACKATHONS.HACKATHON_TEAM_STATS), {
      params,
    });
  }

  hackathonTeamOverTime(hackathonId: number | string): Observable<unknown> {
    const params = new HttpParams().set('hackathon_id', hackathonId);
    return this.http.get<unknown>(
      this.apiRoutesService.getRoute(API_ROUTES.STATS.HACKATHONS.HACKATHON_USER_RESPONSES_TAGS),
      {
        params,
      },
    );
  }
}
