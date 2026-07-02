export interface IProductPrice {
  id?: number;
  product_name: string;
  plan_name: string;
  original_price: number;
  final_price: number;
  discount_amount: number;
  discount_percentage: number;
  currency: string;
  min_quantity: number;
  uuid: string;
  description: string;
  min_subscription_duration_months: number;
  is_subscription_plan: boolean;
  billing_cycle?: string;
  max_kommunities?: number;
  can_create_community_group?: boolean;
  can_create_kommunity?: boolean;
  rzp_billing_interval?: number;
  rzp_plan_id?: string;
  max_community_groups?: number;
  trial_period_days?: number;
  trial_enabled?: boolean;
}

export interface IRazorpayPlan {
  id: string;
  entity: string;
  interval: number;
  period: string;
  item: {
    id: string;
    active: boolean;
    amount: number;
    unit_amount: number;
    currency: string;
    name: string;
    description: string;
  };
  notes: Record<string, string>;
  created_at: number;
}
