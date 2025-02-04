import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICampaign } from '@commudle/shared-models';
import { Observable } from 'rxjs';
import { API_ROUTES } from './api-routes.constant';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class CampaignService {
  constructor(private http: HttpClient, private baseApiService: BaseApiService) {}

  createCampaign(campaignTypeId: number): Observable<ICampaign> {
    return this.http.post<ICampaign>(this.baseApiService.getRoute(API_ROUTES.CAMPAIGNS.CREATE), {
      campaign_type_id: campaignTypeId,
    });
  }

  getCampaign(): Observable<ICampaign[]> {
    return this.http.get<ICampaign[]>(this.baseApiService.getRoute(API_ROUTES.CAMPAIGNS.INDEX));
  }
}
