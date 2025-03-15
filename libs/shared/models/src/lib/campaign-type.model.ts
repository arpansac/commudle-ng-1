import { IUser } from './user.model';

export interface ICampaignType {
  name: string;
  description: string;
  id: number;
  user: IUser;
  active: boolean;
  budget_amount: number;
  image_dimension: { height: number; width: number };
  slug: string;
}

export enum ECampaignTypeSlug {
  COMMUNITY_PAGE_HEADER = 'community_page_header',
  EVENT_BANNER_IMAGE = 'event_banner_image',
}
