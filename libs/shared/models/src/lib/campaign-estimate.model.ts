export interface IMinMaxRange {
  min: number;
  max: number;
}

export interface ICampaignEstimate {
  daily_impressions: IMinMaxRange;
  daily_spend: IMinMaxRange;
  budget: number;
  price_per_impression: number;
  end_date: string;
  remaining_days: number;
  required_daily_impressions: number;
  delivery_status: string;
}
