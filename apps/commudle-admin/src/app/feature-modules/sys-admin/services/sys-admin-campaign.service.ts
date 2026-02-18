import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ECampaignStatus, ICampaign, ICampaignType, IPaginationCount } from '@commudle/shared-models';
import { API_ROUTES } from 'apps/shared-services/api-routes.constants';
import { ApiRoutesService } from 'apps/shared-services/api-routes.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SysAdminCampaignService {
  constructor(private http: HttpClient, private apiRoutesService: ApiRoutesService) {}

  getCampaignTypes(): Observable<ICampaignType[]> {
    return this.http.get<ICampaignType[]>(this.apiRoutesService.getRoute(API_ROUTES.CAMPAIGNS.CAMPAIGNS_TYPES.INDEX));
  }

  createCampaignType(formData): Observable<ICampaignType> {
    return this.http.post<ICampaignType>(this.apiRoutesService.getRoute(API_ROUTES.CAMPAIGNS.CAMPAIGNS_TYPES.CREATE), {
      campaign_type: formData,
    });
  }

  updateCampaignType(formData, campaignTypeId: number): Observable<ICampaignType> {
    const params = new HttpParams().set('campaign_type_id', campaignTypeId);

    return this.http.put<ICampaignType>(
      this.apiRoutesService.getRoute(API_ROUTES.CAMPAIGNS.CAMPAIGNS_TYPES.UPDATE),
      {
        campaign_type: formData,
      },
      {
        params,
      },
    );
  }

  toggleCampaignTypeStatus(campaignTypeId: number): Observable<boolean> {
    return this.http.put<boolean>(this.apiRoutesService.getRoute(API_ROUTES.CAMPAIGNS.CAMPAIGNS_TYPES.TOGGLE_STATUS), {
      campaign_type_id: campaignTypeId,
    });
  }

  index(page = 1, count = 10, statusFilter?: ECampaignStatus): Observable<IPaginationCount<ICampaign>> {
    let params = new HttpParams().set('page', page).set('count', count);
    if (statusFilter) {
      params = params.set('status', statusFilter);
    }
    return this.http.get<IPaginationCount<ICampaign>>(
      this.apiRoutesService.getRoute(API_ROUTES.CAMPAIGNS.CAMPAIGNS_ADMIN_INDEX),
      { params },
    );
  }
}
