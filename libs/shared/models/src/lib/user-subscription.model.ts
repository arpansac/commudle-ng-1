import { ICommunity } from './community.model';
import { IPurchaseOrder } from './purchase-order.model';
import { ICommunityGroup } from './community-group.model';
import { IProductPrice } from './product-price.model';

export interface IUserSubscription {
  id: number;
  user_id: number;
  product_price_id: number;
  purchase_order_id: number;
  status: EUserSubscriptionStatus;
  starts_at: string;
  ends_at: string;
  rzp_subscription_id: string;
  cancellation_requested_at?: string;
  last_billed_at: string;
  next_billing_at: string;
  kommunities_count: number;
  community_groups_count: number;
  created_at: string;
  updated_at: string;
  product_price?: IProductPrice;
  kommunities?: ICommunity[];
  community_groups?: ICommunityGroup[];
  purchase_order: IPurchaseOrder;
}

export enum EUserSubscriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PAYMENT_FAILED = 'payment_failed',
}

export enum EBillingCycle {
  ONE_TIME = 'one_time',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}
