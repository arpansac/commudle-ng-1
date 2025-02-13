import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPurchaseOrder } from '@commudle/shared-models';
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
}
