import { IAttachedFile } from './attached-file.model';

export interface ICommunityGroup {
  id: number;
  name: string;
  description: string;
  slug: string;
  user_subscription_id?: number;
  facebook: string;
  github: string;
  twitter: string;
  website: string;
  linkedin: string;
  logo: IAttachedFile;
  mini_description: string;
  theme_color: string;
  member_count?: number;
  kommunities_count?: number;
  community_channels_count?: number;
  community_count_limit?: number;
}
