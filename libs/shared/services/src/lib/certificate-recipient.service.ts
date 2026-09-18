import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ICertificatePublicRecipient,
  ICertificateRecipient,
  ICertificateRecipientsIndexResponse,
} from '@commudle/shared-models';
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

  sendOne(certificateBatchId: string, recipientId: number): Observable<{ status: string; enqueued: boolean }> {
    const params = new HttpParams().set('certificate_batch_id', certificateBatchId).set('id', recipientId);
    return this.http.post<{ status: string; enqueued: boolean }>(
      this.baseApiService.getRoute(API_ROUTES.CERTIFICATE_RECIPIENTS.SEND_ONE),
      {},
      { params },
    );
  }

  generateOne(certificateBatchId: string, recipientId: number): Observable<{ status: string; enqueued: boolean }> {
    const params = new HttpParams().set('certificate_batch_id', certificateBatchId).set('id', recipientId);
    return this.http.post<{ status: string; enqueued: boolean }>(
      this.baseApiService.getRoute(API_ROUTES.CERTIFICATE_RECIPIENTS.GENERATE_ONE),
      {},
      { params },
    );
  }

  previewPdf(certificateBatchId: string, recipientId: number): Observable<Blob> {
    const params = new HttpParams().set('certificate_batch_id', certificateBatchId).set('id', recipientId);
    return this.http.get(this.baseApiService.getRoute(API_ROUTES.CERTIFICATE_RECIPIENTS.PREVIEW), {
      params,
      responseType: 'blob',
    });
  }

  // The real, permanently-stored certificate (public, no auth) - as opposed
  // to previewPdf(), which re-renders a throwaway copy every time. A plain
  // URL, not an HttpClient call - meant for a direct <a href> link.
  certificateDownloadUrl(recipientUuid: string): string {
    return `${this.baseApiService.getRoute(API_ROUTES.CERTIFICATES.DOWNLOAD)}?uuid=${recipientUuid}`;
  }

  // Public verification page - no auth. 404s if the recipient/batch is
  // revoked, deleted, or the certificate hasn't been issued yet.
  verifyCertificate(recipientUuid: string): Observable<ICertificatePublicRecipient> {
    const params = new HttpParams().set('uuid', recipientUuid);
    return this.http.get<ICertificatePublicRecipient>(this.baseApiService.getRoute(API_ROUTES.CERTIFICATES.VERIFY), {
      params,
    });
  }

  revokeCertificateRecipient(certificateBatchId: string, recipientId: number): Observable<ICertificateRecipient> {
    const params = new HttpParams().set('certificate_batch_id', certificateBatchId).set('id', recipientId);
    return this.http.post<ICertificateRecipient>(
      this.baseApiService.getRoute(API_ROUTES.CERTIFICATE_RECIPIENTS.REVOKE),
      {},
      { params },
    );
  }

  unrevokeCertificateRecipient(certificateBatchId: string, recipientId: number): Observable<ICertificateRecipient> {
    const params = new HttpParams().set('certificate_batch_id', certificateBatchId).set('id', recipientId);
    return this.http.post<ICertificateRecipient>(
      this.baseApiService.getRoute(API_ROUTES.CERTIFICATE_RECIPIENTS.UNREVOKE),
      {},
      { params },
    );
  }
}
