import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPaginationCount, IPurchaseOrder } from '@commudle/shared-models';
import { Observable } from 'rxjs';
import { API_ROUTES } from './api-routes.constant';
import { BaseApiService } from './base-api.service';

/**
 * Client for the FINANCE_ADMIN dashboard endpoints. Read-only list of
 * PurchaseOrders + action to email the invoice PDF to the buyer.
 */
@Injectable({ providedIn: 'root' })
export class FinanceDashboardService {
  constructor(private http: HttpClient, private baseApiService: BaseApiService) {}

  /** Paginated list of POs, filterable by status / orderable_type / free-text q. */
  getPurchaseOrders(
    filters: { page?: number; count?: number; status?: string; orderable_type?: string; q?: string } = {},
  ): Observable<IPaginationCount<IPurchaseOrder>> {
    let params = new HttpParams().set('page', String(filters.page ?? 1)).set('count', String(filters.count ?? 20));

    if (filters.status) params = params.set('status', filters.status);
    if (filters.orderable_type) params = params.set('orderable_type', filters.orderable_type);
    if (filters.q) params = params.set('q', filters.q);

    return this.http.get<IPaginationCount<IPurchaseOrder>>(
      this.baseApiService.getRoute(API_ROUTES.FINANCE_DASHBOARD.PURCHASE_ORDERS),
      { params },
    );
  }

  /**
   * Enqueue an invoice email for the given PO. If `email` is passed, sends to
   * that address; otherwise sends to the buyer's contact_info / user email.
   */
  sendInvoice(
    purchaseOrderUuid: string,
    email?: string,
  ): Observable<{ queued: boolean; invoice_number: string; sent_to: string }> {
    const params = new HttpParams().set('purchase_order_uuid', purchaseOrderUuid);
    return this.http.post<{ queued: boolean; invoice_number: string; sent_to: string }>(
      this.baseApiService.getRoute(API_ROUTES.FINANCE_DASHBOARD.SEND_INVOICE),
      email ? { email } : {},
      { params },
    );
  }

  /**
   * Fetches the rendered invoice PDF as a Blob so it can be opened in a new
   * tab via `URL.createObjectURL`. Fetched authenticated through HttpClient —
   * hitting the URL directly in a new tab would drop auth headers.
   */
  previewInvoice(purchaseOrderUuid: string): Observable<Blob> {
    const params = new HttpParams().set('purchase_order_uuid', purchaseOrderUuid);
    return this.http.get(this.baseApiService.getRoute(API_ROUTES.FINANCE_DASHBOARD.PREVIEW_INVOICE), {
      params,
      responseType: 'blob',
    });
  }
}
