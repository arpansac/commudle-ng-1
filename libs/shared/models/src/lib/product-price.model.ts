export interface IProductPrice {
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
}
