import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ICertificateBatch,
  ICertificateBatchesIndexResponse,
  ICertificateCsvCommitResponse,
  ICertificateCsvPreviewResponse,
  ICertificateProgress,
} from '@commudle/shared-models';
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

  updateCertificateBatch(
    uuid: string,
    batchData: Partial<{
      name: string;
      email_subject: string;
      email_body: string;
      certificate_design_id: number;
    }>,
  ): Observable<ICertificateBatch> {
    const params = new HttpParams().set('id', uuid);
    return this.http.put<ICertificateBatch>(
      this.baseApiService.getRoute(API_ROUTES.CERTIFICATE_BATCHES.UPDATE),
      { certificate_batch: batchData },
      { params },
    );
  }

  csvPreview(uuid: string, file: File): Observable<ICertificateCsvPreviewResponse> {
    const params = new HttpParams().set('id', uuid);
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ICertificateCsvPreviewResponse>(
      this.baseApiService.getRoute(API_ROUTES.CERTIFICATE_BATCHES.CSV_PREVIEW),
      formData,
      { params },
    );
  }

  csvCommit(uuid: string, file: File): Observable<ICertificateCsvCommitResponse> {
    const params = new HttpParams().set('id', uuid);
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ICertificateCsvCommitResponse>(
      this.baseApiService.getRoute(API_ROUTES.CERTIFICATE_BATCHES.CSV_COMMIT),
      formData,
      { params },
    );
  }

  sendBatch(uuid: string): Observable<{ status: string; enqueued: boolean }> {
    const params = new HttpParams().set('id', uuid);
    return this.http.post<{ status: string; enqueued: boolean }>(
      this.baseApiService.getRoute(API_ROUTES.CERTIFICATE_BATCHES.SEND),
      { consent_confirmed: true },
      { params },
    );
  }

  resendBatch(uuid: string): Observable<{ status: string; enqueued: boolean }> {
    const params = new HttpParams().set('id', uuid);
    return this.http.post<{ status: string; enqueued: boolean }>(
      this.baseApiService.getRoute(API_ROUTES.CERTIFICATE_BATCHES.RESEND),
      {},
      { params },
    );
  }

  getProgress(uuid: string): Observable<ICertificateProgress> {
    const params = new HttpParams().set('id', uuid);
    return this.http.get<ICertificateProgress>(this.baseApiService.getRoute(API_ROUTES.CERTIFICATE_BATCHES.PROGRESS), {
      params,
    });
  }

  revokeBatch(uuid: string): Observable<ICertificateBatch> {
    const params = new HttpParams().set('id', uuid);
    return this.http.post<ICertificateBatch>(
      this.baseApiService.getRoute(API_ROUTES.CERTIFICATE_BATCHES.REVOKE),
      {},
      { params },
    );
  }

  unrevokeBatch(uuid: string): Observable<ICertificateBatch> {
    const params = new HttpParams().set('id', uuid);
    return this.http.post<ICertificateBatch>(
      this.baseApiService.getRoute(API_ROUTES.CERTIFICATE_BATCHES.UNREVOKE),
      {},
      { params },
    );
  }
}
