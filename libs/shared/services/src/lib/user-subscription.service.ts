import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IUserSubscription, IPaginationCount, IPurchaseOrder } from '@commudle/shared-models';
import { API_ROUTES } from './api-routes.constant';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class UserSubscriptionService {
  constructor(private http: HttpClient, private baseApiService: BaseApiService) {}

  // getSubscriptionPlans(): Observable<IProductPrice[]> {
  //   return this.http.get<IProductPrice[]>(
  //     this.baseApiService.getRoute(API_ROUTES.PRODUCT_PRICES.SUBSCRIPTION_PLANS),
  //   );
  // }

  getMySubscriptions(page = 1, count = 5): Observable<IPaginationCount<IUserSubscription>> {
    const params = new HttpParams().set('page', page).set('count', count);
    return this.http.get<IPaginationCount<IUserSubscription>>(
      this.baseApiService.getRoute(API_ROUTES.USER_SUBSCRIPTIONS.INDEX),
      { params },
    );
  }

  getStats(): Observable<{
    active_count: number;
    trialing_count: number;
    expired_count: number;
  }> {
    return this.http.get<{
      active_count: number;
      trialing_count: number;
      expired_count: number;
    }>(this.baseApiService.getRoute(API_ROUTES.USER_SUBSCRIPTIONS.STATS));
  }

  getPaymentHistory(page = 1, count = 10): Observable<IPaginationCount<IPurchaseOrder>> {
    const params = new HttpParams().set('page', page).set('count', count);
    return this.http.get<IPaginationCount<IPurchaseOrder>>(
      this.baseApiService.getRoute(API_ROUTES.USER_SUBSCRIPTIONS.PAYMENT_HISTORY),
      { params },
    );
  }

  createSubscription(productPriceId: number): Observable<IUserSubscription> {
    return this.http.post<IUserSubscription>(this.baseApiService.getRoute(API_ROUTES.USER_SUBSCRIPTIONS.CREATE), {
      user_subscription: { product_price_id: productPriceId },
    });
  }

  getSubscription(id: number): Observable<IUserSubscription> {
    const params = new HttpParams().set('id', id);
    return this.http.get<IUserSubscription>(this.baseApiService.getRoute(API_ROUTES.USER_SUBSCRIPTIONS.SHOW), {
      params,
    });
  }
}
