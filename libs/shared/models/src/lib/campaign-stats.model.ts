export interface ICampaignStats {
  total_clicks: number;
  total_views: number;
  clicks_over_time: {
    [key: string]: number;
  };
  views_over_time: {
    [key: string]: number;
  };
  clicks_over_days: {
    [key: string]: number;
  };
  views_over_days: {
    [key: string]: number;
  };
}
