import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICampaignType } from '@commudle/shared-models';
import { API_ROUTES } from 'apps/shared-services/api-routes.constants';
import { ApiRoutesService } from 'apps/shared-services/api-routes.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SysAdminCampaignTypesService {
  constructor(private http: HttpClient, private apiRoutesService: ApiRoutesService) {}

  getCampaignTypes(): Observable<ICampaignType[]> {
    return this.http.get<ICampaignType[]>(this.apiRoutesService.getRoute(API_ROUTES.CAMPAIGNS_TYPES.INDEX));
  }

  createCampaignType(formData): Observable<ICampaignType> {
    return this.http.post<ICampaignType>(this.apiRoutesService.getRoute(API_ROUTES.CAMPAIGNS_TYPES.CREATE), {
      campaign_type: formData,
    });
  }

  updateCampaignType(formData, campaignId: number): Observable<ICampaignType> {
    const params = new HttpParams().set('campaign_id', campaignId);

    return this.http.put<ICampaignType>(
      this.apiRoutesService.getRoute(API_ROUTES.CAMPAIGNS_TYPES.UPDATE),
      {
        campaign_type: formData,
      },
      {
        params,
      },
    );
  }

  toggleCampaignStatus(campaignId: number): Observable<boolean> {
    const params = new HttpParams().set('campaign_id', campaignId);

    return this.http.delete<boolean>(this.apiRoutesService.getRoute(API_ROUTES.CAMPAIGNS_TYPES.TOGGLE_STATUS), {
      params,
    });
  }
}
