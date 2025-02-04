import { HttpClient, HttpParams } from '@angular/common/http';
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

  indexCampaigns(): Observable<ICampaign[]> {
    return this.http.get<ICampaign[]>(this.baseApiService.getRoute(API_ROUTES.CAMPAIGNS.INDEX));
  }

  updateCampaign(formData, campaignId: number): Observable<ICampaign> {
    const params = new HttpParams().set('campaign_id', campaignId);

    return this.http.put<ICampaign>(
      this.baseApiService.getRoute(API_ROUTES.CAMPAIGNS.UPDATE),
      {
        campaign: formData,
      },
      {
        params,
      },
    );
  }

  fetchCampaign(campaignId: number): Observable<ICampaign> {
    const params = new HttpParams().set('campaign_id', campaignId);
    return this.http.get<ICampaign>(this.baseApiService.getRoute(API_ROUTES.CAMPAIGNS.SHOW), { params });
  }
}
