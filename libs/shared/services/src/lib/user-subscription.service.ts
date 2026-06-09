import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IUserSubscription, IUserSubscriptionPlan, IPaginationCount } from '@commudle/shared-models';
import { API_ROUTES } from './api-routes.constant';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class UserSubscriptionService {
  constructor(private http: HttpClient, private baseApiService: BaseApiService) {}

  // getSubscriptionPlans(): Observable<IUserSubscriptionPlan[]> {
  //   return this.http.get<IUserSubscriptionPlan[]>(
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
