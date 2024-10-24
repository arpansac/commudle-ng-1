import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiRoutesService } from './api-routes.service';
import { API_ROUTES } from './api-routes.constants';

@Injectable({
  providedIn: 'root',
})
export class UserEngagementRecordsService {
  constructor(private http: HttpClient, private apiRoutesService: ApiRoutesService) {}

  userEngagementRecords() {
    // let params = params.set();
    // this.http.post(this.apiRoutesService.getRoute(API_ROUTES.USER_ENGAGEMENT_RECORDS.CREATE), { params });
  }
}
