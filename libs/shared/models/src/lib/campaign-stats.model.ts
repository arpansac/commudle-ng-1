import { ITag } from './tag.model';

export interface ICampaignStats {
  total_clicks: number;
  total_views: number;
  clicks_over_time: { x: string; y: number }[];
  views_over_time: { x: string; y: number }[];
  clicks_over_days: { x: string; y: number }[];
  views_over_days: { x: string; y: number }[];
  tags: {
    total: number;
    tags: ITag[];
  };
  gender: {
    male: number;
    female: number;
    prefer_not_to_answer: number;
    unknown: number;
    NA: number;
  };
  locations: [];
  newsletter_email_stats: {
    opens: number;
    uniq_opens: number;
    clicks: number;
    uniq_clicks: number;
    delivered: number;
    sents: number;
  };
  total_impressions: number;
  ctr: number | { date: string; value: number }[];
  budget_remaining: number;
  impressions: number;
  clicks: number | { date: string; value: number }[];
  total_budget_utilization: number;
}
