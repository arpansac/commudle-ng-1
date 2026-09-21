import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICertificateDesign, ICertificateDesignsIndexResponse } from '@commudle/shared-models';
import { Observable } from 'rxjs';
import { API_ROUTES } from './api-routes.constant';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class CertificateDesignService {
  constructor(private http: HttpClient, private baseApiService: BaseApiService) {}

  indexCertificateDesigns(
    kommunityId?: number | string,
    filter: 'presets' | 'own' | 'all' = 'all',
    page = 1,
    count = 4,
  ): Observable<ICertificateDesignsIndexResponse> {
    let params = new HttpParams().set('filter', filter).set('page', page).set('count', count);
    if (kommunityId) {
      params = params.set('kommunity_id', kommunityId);
    }
    return this.http.get<ICertificateDesignsIndexResponse>(
      this.baseApiService.getRoute(API_ROUTES.CERTIFICATE_DESIGNS.INDEX),
      { params },
    );
  }

  createCertificateDesign(kommunityId: number | string, designData: FormData): Observable<ICertificateDesign> {
    const params = new HttpParams().set('kommunity_id', kommunityId);
    return this.http.post<ICertificateDesign>(
      this.baseApiService.getRoute(API_ROUTES.CERTIFICATE_DESIGNS.CREATE),
      designData,
      { params },
    );
  }
}
