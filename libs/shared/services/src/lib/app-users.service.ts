import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { API_ROUTES } from './api-routes.constant';
import { IProfileCompletionStatus, IUserRecapStats, IUserStat } from '@commudle/shared-models';

@Injectable({
  providedIn: 'root',
})
export class AppUsersService {
  private profileCompletionStatus = new BehaviorSubject<IProfileCompletionStatus>(null);
  public profileCompletionStatus$ = this.profileCompletionStatus.asObservable();

  constructor(private http: HttpClient, private baseApiService: BaseApiService) {}

  getMyRoles(parentType, parentId): Observable<[]> {
    const params = new HttpParams().set('parent_type', parentType).set('parent_id', parentId);
    return this.http.get<[]>(this.baseApiService.getRoute(API_ROUTES.USERS.GET_MY_ROLES), { params });
  }

  getRecapSummary(username: string): Observable<IUserRecapStats> {
    const params = new HttpParams().set('username', username);
    return this.http.get<IUserRecapStats>(this.baseApiService.getRoute(API_ROUTES.USERS.RECAP_STATS), {
      params,
    });
  }

  fetchProfileCompletionStatus(): void {
    this.http
      .get<IProfileCompletionStatus>(this.baseApiService.getRoute(API_ROUTES.USERS.PROFILE_COMPLETION_STATUS))
      .subscribe((status) => {
        this.profileCompletionStatus.next(status);
      });
  }

  getProfileStats(): Observable<IUserStat> {
    return this.http.get<IUserStat>(this.baseApiService.getRoute(API_ROUTES.USERS.PROFILE_STATS));
  }
}
