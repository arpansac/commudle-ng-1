import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiRoutesService } from 'apps/shared-services/api-routes.service';
import { API_ROUTES } from 'apps/shared-services/api-routes.constants';
import { ICampaign } from '@commudle/shared-models';

@Injectable({
  providedIn: 'root',
})
export class CampaignResolver implements Resolve<ICampaign> {
  constructor(private http: HttpClient, private apiRoutesService: ApiRoutesService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ICampaign> {
    const campaignId = route.parent.params.campaign_id || route.params.campaign_id;
    const params = new HttpParams().set('campaign_id', campaignId);
    return this.http.get<ICampaign>(this.apiRoutesService.getRoute(API_ROUTES.CAMPAIGNS.SHOW), { params });
  }
}
