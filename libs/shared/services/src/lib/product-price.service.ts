import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IProductPrice, IPurchaseOrder } from '@commudle/shared-models';
import { Observable } from 'rxjs';
import { API_ROUTES } from './api-routes.constant';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class ProductPriceService {
  constructor(private http: HttpClient, private baseApiService: BaseApiService) {}

  create(productPrice: Partial<IProductPrice>): Observable<IProductPrice> {
    return this.http.post<IProductPrice>(this.baseApiService.getRoute(API_ROUTES.PRODUCT_PRICES.CREATE), {
      product_price: productPrice,
    });
  }

  edit(id: string, productPrice: Partial<IProductPrice>): Observable<IProductPrice> {
    return this.http.put<IProductPrice>(this.baseApiService.getRoute(API_ROUTES.PRODUCT_PRICES.UPDATE), {
      id,
      product_price: productPrice,
    });
  }

  index(): Observable<IProductPrice[]> {
    return this.http.get<IProductPrice[]>(this.baseApiService.getRoute(API_ROUTES.PRODUCT_PRICES.INDEX));
  }

  show(priceUuid: string): Observable<IProductPrice> {
    const params = new HttpParams().set('price_uuid', priceUuid);
    return this.http.get<IProductPrice>(this.baseApiService.getRoute(API_ROUTES.PRODUCT_PRICES.SHOW), { params });
  }

  showById(id: number): Observable<IProductPrice> {
    const params = new HttpParams().set('id', id);
    return this.http.get<IProductPrice>(this.baseApiService.getRoute(API_ROUTES.PRODUCT_PRICES.SHOW_BY_ID), { params });
  }

  createPurchaseOrder(PriceUuid: string): Observable<IPurchaseOrder> {
    const params = new HttpParams().set('price_uuid', PriceUuid);
    return this.http.post<IPurchaseOrder>(
      this.baseApiService.getRoute(API_ROUTES.PRODUCT_PRICES.CREATE_PURCHASE_ORDER),
      {},
      { params },
    );
  }
}
