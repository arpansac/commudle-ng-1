import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICertificateBatch, ICertificateBatchesIndexResponse } from '@commudle/shared-models';
import { Observable } from 'rxjs';
import { API_ROUTES } from './api-routes.constant';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class CertificateBatchService {
  constructor(private http: HttpClient, private baseApiService: BaseApiService) {}

  indexCertificateBatches(
    kommunityId: number | string,
    page = 1,
    count = 10,
  ): Observable<ICertificateBatchesIndexResponse> {
    const params = new HttpParams().set('kommunity_id', kommunityId).set('page', page).set('count', count);
    return this.http.get<ICertificateBatchesIndexResponse>(
      this.baseApiService.getRoute(API_ROUTES.CERTIFICATE_BATCHES.INDEX),
      {
        params,
      },
    );
  }

  fetchCertificateBatch(uuid: string): Observable<ICertificateBatch> {
    const params = new HttpParams().set('id', uuid);
    return this.http.get<ICertificateBatch>(this.baseApiService.getRoute(API_ROUTES.CERTIFICATE_BATCHES.SHOW), {
      params,
    });
  }

  createCertificateBatch(kommunityId: number | string, batchData: FormData): Observable<ICertificateBatch> {
    const params = new HttpParams().set('kommunity_id', kommunityId);
    return this.http.post<ICertificateBatch>(
      this.baseApiService.getRoute(API_ROUTES.CERTIFICATE_BATCHES.CREATE),
      batchData,
      { params },
    );
  }

  updateCertificateBatch(uuid: string, batchData: { certificate_design_id: number }): Observable<ICertificateBatch> {
    const params = new HttpParams().set('id', uuid);
    return this.http.put<ICertificateBatch>(
      this.baseApiService.getRoute(API_ROUTES.CERTIFICATE_BATCHES.UPDATE),
      { certificate_batch: batchData },
      { params },
    );
  }
}
