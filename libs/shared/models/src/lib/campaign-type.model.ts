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
  LISTING_PAGE_EVENTS_BANNER = 'listing-page-events-banner-image',
  LISTING_PAGE_COMMUNITIES_BANNER = 'listing-page-communities-banner-image',
  LISTING_PAGE_SPEAKERS_BANNER = 'listing-page-speakers-banner-image',
  LISTING_PAGE_LABS_BANNER = 'listing-page-labs-banner-image',
  LISTING_PAGE_BUILDS_BANNER = 'listing-page-builds-banner-image',
  USER_DASHBOARD_RIGHT_SIDEBAR = 'user-dashboard-right-sidebar-image',
  EVENT_BANNER = 'event_banner_image',
  USER_PROFILE_RIGHT_SIDEBAR_IMAGE = 'user-profile-right-sidebar-image',
  USER_NOTIFICATION_RIGHT_SIDEBAR_IMAGE = 'user-notification-right-sidebar-image',
  MAIN_SEARCH_PAGE_RIGHT_SIDEBAR_IMAGE = 'main-search-page-right-sidebar-image',
  MAIN_NEWSLETTER = 'main-newsletter',
}
