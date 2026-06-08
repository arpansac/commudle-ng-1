export interface IUserSubscription {
  id: number;
  user_id: number;
  product_price_id: number;
  purchase_order_id: number;
  status: EUserSubscriptionStatus;
  starts_at: string;
  ends_at: string;
  rzp_subscription_id: string;
  last_billed_at: string;
  next_billing_at: string;
  kommunities_count: number;
  community_groups_count: number;
  created_at: string;
  updated_at: string;
  product_price?: IUserSubscriptionPlan;
}

export interface IUserSubscriptionPlan {
  id: number;
  plan_name: string;
  product_name: string;
  original_price: number;
  final_price: number;
  currency: string;
  billing_cycle: EBillingCycle;
  can_create_kommunity: boolean;
  can_create_community_group: boolean;
  max_kommunities: number;
  max_community_groups: number;
  description: string;
  uuid: string;
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
