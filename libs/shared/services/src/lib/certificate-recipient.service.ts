import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICertificateRecipient, ICertificateRecipientsIndexResponse } from '@commudle/shared-models';
import { Observable } from 'rxjs';
import { API_ROUTES } from './api-routes.constant';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class CertificateRecipientService {
  constructor(private http: HttpClient, private baseApiService: BaseApiService) {}

  indexCertificateRecipients(
    certificateBatchId: string,
    page = 1,
    count = 10,
    status?: string,
    q?: string,
  ): Observable<ICertificateRecipientsIndexResponse> {
    let params = new HttpParams().set('certificate_batch_id', certificateBatchId).set('page', page).set('count', count);
    if (status) {
      params = params.set('status', status);
    }
    if (q) {
      params = params.set('q', q);
    }
    return this.http.get<ICertificateRecipientsIndexResponse>(
      this.baseApiService.getRoute(API_ROUTES.CERTIFICATE_RECIPIENTS.INDEX),
      { params },
    );
  }

  createCertificateRecipient(
    certificateBatchId: string,
    recipientData: { email: string; name?: string; row_values?: { [key: string]: string } },
  ): Observable<ICertificateRecipient> {
    const params = new HttpParams().set('certificate_batch_id', certificateBatchId);
    return this.http.post<ICertificateRecipient>(
      this.baseApiService.getRoute(API_ROUTES.CERTIFICATE_RECIPIENTS.CREATE),
      { certificate_recipient: recipientData },
      { params },
    );
  }

  updateCertificateRecipient(
    certificateBatchId: string,
    recipientId: number,
    recipientData: { name?: string; row_values?: { [key: string]: string } },
  ): Observable<ICertificateRecipient> {
    const params = new HttpParams().set('certificate_batch_id', certificateBatchId).set('id', recipientId);
    return this.http.put<ICertificateRecipient>(
      this.baseApiService.getRoute(API_ROUTES.CERTIFICATE_RECIPIENTS.UPDATE),
      { certificate_recipient: recipientData },
      { params },
    );
  }

  deleteCertificateRecipient(certificateBatchId: string, recipientId: number): Observable<{ deleted: boolean }> {
    const params = new HttpParams().set('certificate_batch_id', certificateBatchId).set('id', recipientId);
    return this.http.delete<{ deleted: boolean }>(
      this.baseApiService.getRoute(API_ROUTES.CERTIFICATE_RECIPIENTS.DELETE),
      { params },
    );
  }
}
