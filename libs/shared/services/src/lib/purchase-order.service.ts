import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EDbModels, IContactInfo, IPaginationCount, IPurchaseOrder } from '@commudle/shared-models';
import { Observable } from 'rxjs';
import { API_ROUTES } from './api-routes.constant';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderService {
  constructor(private http: HttpClient, private baseApiService: BaseApiService) {}

  showPurchaseOrder(purchaseOrderUuid: string): Observable<IPurchaseOrder> {
    const params = new HttpParams().set('purchase_order_uuid', purchaseOrderUuid);
    return this.http.get<IPurchaseOrder>(this.baseApiService.getRoute(API_ROUTES.PURCHASE_ORDER.SHOW), { params });
  }

  indexByOrderType(
    orderableType: EDbModels,
    page = 1,
    count = 10,
    search?,
  ): Observable<IPaginationCount<IPurchaseOrder>> {
    let params = new HttpParams().set('orderable_type', orderableType).set('page', page).set('count', count);
    if (search) {
      params = params.set('q', search);
    }
    return this.http.get<IPaginationCount<IPurchaseOrder>>(
      this.baseApiService.getRoute(API_ROUTES.PURCHASE_ORDER.INDEX_BY_ORDERABLE_TYPE),
      { params },
    );
  }

  createContactInfo(purchaseOrderUuid: string, formData): Observable<IContactInfo> {
    return this.http.post<IContactInfo>(this.baseApiService.getRoute(API_ROUTES.PURCHASE_ORDER.CONTACT_INFO), {
      contact_info: formData,
      purchase_order_uuid: purchaseOrderUuid,
    });
  }

  updatePurchaseOrder(
    purchaseOrderUuid: string,
    data: { quantity?: number; subscription_months?: number; discount_code?: string },
  ): Observable<IPurchaseOrder> {
    return this.http.put<IPurchaseOrder>(this.baseApiService.getRoute(API_ROUTES.PURCHASE_ORDER.UPDATE), {
      purchase_order_uuid: purchaseOrderUuid,
      ...data,
    });
  }

  markPaidForFullyDiscounted(purchaseOrderUuid: string): Observable<IPurchaseOrder> {
    return this.http.put<IPurchaseOrder>(
      this.baseApiService.getRoute(API_ROUTES.PURCHASE_ORDER.MARK_PAID_FOR_FULLY_DISCOUNTED),
      { purchase_order_uuid: purchaseOrderUuid },
    );
  }
}
