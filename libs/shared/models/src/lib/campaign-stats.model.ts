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
}
