import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ROUTES } from './api-routes.constant';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class UserEngagementRecordsService {
  constructor(private http: HttpClient, private baseApiService: BaseApiService) {}

  userEngagementRecords(feedData) {
    return this.http.post(this.baseApiService.getRoute(API_ROUTES.USER_ENGAGEMENT_RECORDS.CREATE), feedData);
  }
}
