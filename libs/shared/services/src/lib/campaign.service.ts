import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ECampaignStatus, ICampaign, ICampaignStats, IPaginationCount } from '@commudle/shared-models';
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

  indexCampaigns(page = 1, count = 10): Observable<IPaginationCount<ICampaign>> {
    const params = new HttpParams().set('page', page).set('count', count);
    return this.http.get<IPaginationCount<ICampaign>>(this.baseApiService.getRoute(API_ROUTES.CAMPAIGNS.INDEX), {
      params,
    });
  }

  updateCampaign(formData, campaignId: number): Observable<ICampaign> {
    const params = new HttpParams().set('campaign_id', campaignId);

    return this.http.put<ICampaign>(this.baseApiService.getRoute(API_ROUTES.CAMPAIGNS.UPDATE), formData, {
      params,
    });
  }

  fetchCampaign(campaignId: number): Observable<ICampaign> {
    const params = new HttpParams().set('campaign_id', campaignId);
    return this.http.get<ICampaign>(this.baseApiService.getRoute(API_ROUTES.CAMPAIGNS.SHOW), { params });
  }

  campaignAdminUpdateStatus(campaignId: number, campaignStatus: ECampaignStatus): Observable<ICampaign> {
    return this.http.put<ICampaign>(this.baseApiService.getRoute(API_ROUTES.CAMPAIGNS.CAMPAIGN_ADMIN_STATUS_UPDATE), {
      campaign_id: campaignId,
      campaign_status: campaignStatus,
    });
  }

  updateTags(campaignId: number, tags: string[]): Observable<ICampaign> {
    return this.http.put<ICampaign>(this.baseApiService.getRoute(API_ROUTES.CAMPAIGNS.UPDATE_TAGS), {
      campaign_id: campaignId,
      tags,
    });
  }

  calculateBudget(campaignId: number, startDate, endDate, startTime, endTime): Observable<ICampaign> {
    const params = new HttpParams()
      .set('campaign_id', campaignId)
      .set('start_date', startDate)
      .set('end_date', endDate)
      .set('start_time', startTime)
      .set('end_time', endTime);
    return this.http.get<ICampaign>(this.baseApiService.getRoute(API_ROUTES.CAMPAIGNS.CALC_ESTIMATED_PRICE), {
      params,
    });
  }

  getStats(campaignId: number): Observable<ICampaignStats> {
    const params = new HttpParams().set('campaign_id', campaignId);
    return this.http.get<ICampaignStats>(this.baseApiService.getRoute(API_ROUTES.CAMPAIGNS.STATS), {
      params,
    });
  }

  //PUBLIC API
  indexOngoingCampaign(campaignTypeSlug: string | number): Observable<ICampaign> {
    const params = new HttpParams().set('campaign_type_id', campaignTypeSlug);
    return this.http.get<ICampaign>(this.baseApiService.getRoute(API_ROUTES.CAMPAIGNS.PUBLIC.ONGOING_CAMPAIGN), {
      params,
    });
  }
}
