import { ITag } from './tag.model';

export interface ICampaignStats {
  total_clicks: number;
  total_views: number;
  clicks_over_time: { x: string; y: number }[];
  views_over_time: { x: string; y: number }[];
  clicks_over_days: { x: string; y: number }[];
  views_over_days: { x: string; y: number }[];
  user_tags: {
    total: number;
    tags: ITag[];
  };
  user_gender_distribution: {
    male: number;
    female: number;
    prefer_not_to_answer: number;
    NA: number;
  };
  user_locations: [];
  newsletter_email_stats: {
    opens: number;
    uniq_opens: number;
    clicks: number;
    uniq_clicks: number;
    delivered: number;
    sents: number;
  };
  total_impressions: number;
  ctr: number;
  budget_remaining: number;
  impressions: number;
  clicks: number;
}
