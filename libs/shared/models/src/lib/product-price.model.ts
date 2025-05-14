export interface IProductPrice {
  product_name: string;
  plan_name: string;
  original_price: number;
  final_price: number;
  discount: number;
  currency: string;
  min_quantity: number;
}
