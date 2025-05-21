import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EDbModels, IDiscountCode } from '@commudle/shared-models';
import { API_ROUTES } from './api-routes.constant';
import { BaseApiService } from './base-api.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DiscountCodesService {
  private discountCodes = new BehaviorSubject<IDiscountCode[]>([]);
  public discountCodes$ = this.discountCodes.asObservable();

  constructor(private baseApiService: BaseApiService, private http: HttpClient) {}

  indexDiscountCodesByEvent(eventId) {
    const params = new HttpParams().set('event_id', eventId);
    this.http
      .get<IDiscountCode[]>(this.baseApiService.getRoute(API_ROUTES.DISCOUNT_CODES.INDEX), {
        params,
      })
      .subscribe((discountCodes) => {
        this.discountCodes.next(discountCodes);
      });
  }

  updateDiscountIndex(discountCode) {
    const currentDiscountCodes = this.discountCodes.value;
    currentDiscountCodes.push(discountCode);
    this.discountCodes.next(currentDiscountCodes);
  }

  createDiscountCode(discount_code: any, eventId): Observable<any> {
    const params = new HttpParams().set('event_id', eventId);
    return this.http.post<any>(this.baseApiService.getRoute(API_ROUTES.DISCOUNT_CODES.CREATE), discount_code, {
      params,
    });
  }

  indexByParentOrObject(id: number, type: EDbModels, isParent = true): Observable<IDiscountCode[]> {
    let params = new HttpParams();

    if (isParent) {
      params = params.set('parent_id', id).set('parent_type', type);
    } else {
      params = params.set('object_type', type);
    }

    return this.http.get<IDiscountCode[]>(this.baseApiService.getRoute(API_ROUTES.DISCOUNT_CODES.INDEX_BY_TYPE), {
      params,
    });
  }

  updateDiscountCodes(discount_code: any, discountCodeId): Observable<any> {
    const params = new HttpParams().set('discount_code_id', discountCodeId);
    return this.http.put<any>(this.baseApiService.getRoute(API_ROUTES.DISCOUNT_CODES.UPDATE), discount_code, {
      params,
    });
  }

  canBeApplied(code, edfegId, amount, eventId, usersCount): Observable<any> {
    const params = new HttpParams()
      .set('code', code)
      .set('event_data_form_entity_group_id', edfegId)
      .set('amount', amount)
      .set('event_id', eventId)
      .set('users_count', usersCount);
    return this.http.get<any>(this.baseApiService.getRoute(API_ROUTES.DISCOUNT_CODES.CAN_BE_APPLIED), {
      params,
    });
  }
}
