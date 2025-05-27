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

  createDiscountCode(
    discountCodeFormData: { discount_code: IDiscountCode },
    eventId?: number | string,
  ): Observable<IDiscountCode> {
    let params = new HttpParams();
    if (eventId) {
      params = params.set('event_id', eventId);
    }
    return this.http.post<IDiscountCode>(
      this.baseApiService.getRoute(API_ROUTES.DISCOUNT_CODES.CREATE),
      discountCodeFormData,
      {
        params,
      },
    );
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

  updateDiscountCodes(discount_code: { discount_code: IDiscountCode }, discountCodeId): Observable<IDiscountCode> {
    const params = new HttpParams().set('discount_code_id', discountCodeId);
    return this.http.put<IDiscountCode>(this.baseApiService.getRoute(API_ROUTES.DISCOUNT_CODES.UPDATE), discount_code, {
      params,
    });
  }

  canBeApplied(options: {
    code: string;
    amount: number;
    usersCount: number;
    edfegId?: number;
    eventId?: number;
    objectType?: EDbModels;
  }): Observable<any> {
    let params = new HttpParams()
      .set('code', options.code)
      .set('amount', options.amount)
      .set('users_count', options.usersCount);

    if (options.eventId) {
      params = params.set('event_id', options.eventId);
    }
    if (options.edfegId) {
      params = params.set('event_data_form_entity_group_id', options.edfegId);
    }
    if (options.objectType) {
      params = params.set('object_type', options.objectType);
    }

    return this.http.get<any>(this.baseApiService.getRoute(API_ROUTES.DISCOUNT_CODES.CAN_BE_APPLIED), {
      params,
    });
  }

  destroy(discountCodeId: number): Observable<boolean> {
    const params = new HttpParams().set('discount_code_id', discountCodeId);
    return this.http.delete<boolean>(this.baseApiService.getRoute(API_ROUTES.DISCOUNT_CODES.DELETE), { params });
  }
}
