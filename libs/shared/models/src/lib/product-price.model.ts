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
  can_create_community_group?: boolean;
  can_create_kommunity?: boolean;
  trial_period_days?: number;
  trial_enabled?: boolean;
}
