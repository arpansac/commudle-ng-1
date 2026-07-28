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

  /**
   * Cancel a subscription. By default it cancels at the end of the current billing
   * cycle so the user keeps access until the paid period ends.
   */
  cancelSubscription(id: number, cancelAtCycleEnd = true): Observable<IUserSubscription> {
    return this.http.post<IUserSubscription>(this.baseApiService.getRoute(API_ROUTES.USER_SUBSCRIPTIONS.CANCEL), {
      id,
      cancel_at_cycle_end: cancelAtCycleEnd,
    });
  }

  addCommunities(
    userSubscriptionId: number,
    extraCommunities: number,
    communityGroupId?: number,
  ): Observable<IPurchaseOrder> {
    return this.http.post<IPurchaseOrder>(this.baseApiService.getRoute(API_ROUTES.USER_SUBSCRIPTIONS.ADD_COMMUNITIES), {
      user_subscription_id: userSubscriptionId,
      extra_communities: extraCommunities,
      ...(communityGroupId ? { community_group_id: communityGroupId } : {}),
    });
  }

  /**
   * Checks upfront whether the current user can start a trial for the given
   * plan — before they pay the $1 card verification charge. Mirrors the same
   * rule enforced server-side in `startTrial` (one non-expired subscription
   * per plan), so an ineligible user can be told immediately on checkout
   * instead of after paying the verification charge.
   */
  checkTrialEligibility(productPriceId: number): Observable<{ eligible: boolean; reason?: string }> {
    const params = new HttpParams().set('product_price_id', productPriceId);
    return this.http.get<{ eligible: boolean; reason?: string }>(
      this.baseApiService.getRoute(API_ROUTES.USER_SUBSCRIPTIONS.TRIAL_ELIGIBILITY),
      { params },
    );
  }

  /**
   * Provision a free trial after the card verification auth has completed.
   * The frontend obtains the auth-only Razorpay Order for the trial verification
   * via `RazorpayService.createOrFindOrder(...)` with the `po_id`, opens Razorpay
   * Checkout, and passes the resulting signature + `po_id` here so the backend
   * can verify the signature, create the UserSubscription linked to the PO
   * (with proper quota / metadata / etc.), and refund the hold.
   */
  startTrial(
    productPriceId: number,
    verification: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
      po_id?: number;
    },
  ): Observable<IUserSubscription> {
    return this.http.post<IUserSubscription>(this.baseApiService.getRoute(API_ROUTES.USER_SUBSCRIPTIONS.START_TRIAL), {
      product_price_id: productPriceId,
      po_id: verification.po_id,
      razorpay_payment_id: verification.razorpay_payment_id,
      razorpay_order_id: verification.razorpay_order_id,
      razorpay_signature: verification.razorpay_signature,
    });
  }

  /**
   * Kick off a renewal: creates a fresh PurchaseOrder mirroring the existing
   * subscription's price/quantity/months. The frontend then routes to the checkout page
   * for this PO like a first-time purchase. On payment, the existing subscription's
   * ends_at is extended by the backend.
   */
  renew(userSubscriptionId: number): Observable<IPurchaseOrder> {
    return this.http.post<IPurchaseOrder>(this.baseApiService.getRoute(API_ROUTES.USER_SUBSCRIPTIONS.RENEW), {
      user_subscription_id: userSubscriptionId,
    });
  }
}
