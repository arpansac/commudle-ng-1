import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICampaignType } from '@commudle/shared-models';
import { Observable } from 'rxjs';
import { API_ROUTES } from './api-routes.constant';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class CampaignTypeService {
  constructor(private http: HttpClient, private baseApiService: BaseApiService) {}

  getCampaignTypes(): Observable<ICampaignType[]> {
    return this.http.get<ICampaignType[]>(
      this.baseApiService.getRoute(API_ROUTES.CAMPAIGNS.CAMPAIGNS_TYPES.PUBLIC.INDEX),
    );
  }
}
