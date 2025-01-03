import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IBadge } from 'apps/shared-models/badge.model';
import { IBadges } from 'apps/shared-models/badges.model';
import { API_ROUTES } from 'apps/shared-services/api-routes.constants';
import { ApiRoutesService } from 'apps/shared-services/api-routes.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SysAdminCampaignTypesService {
  constructor(private http: HttpClient, private apiRoutesService: ApiRoutesService) {}

  getCampaignTypes(): Observable<IBadges> {
    return this.http.get<IBadges>(this.apiRoutesService.getRoute(API_ROUTES.CAMPAIGNS_TYPES.INDEX));
  }

  createCampaignType(formData): Observable<IBadge> {
    return this.http.post<IBadge>(this.apiRoutesService.getRoute(API_ROUTES.CAMPAIGNS_TYPES.CREATE), {
      campaign_type: formData,
    });
  }

  updateCampaignType(formData, campaignId: number): Observable<IBadge> {
    const params = new HttpParams().set('campaign_id', campaignId);

    return this.http.put<IBadge>(
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
