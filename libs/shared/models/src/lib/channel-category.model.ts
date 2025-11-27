import { IForum } from './forum.model';

export interface IChannelCategory {
  name: string;
  slug: string;
  channels_count: number;
  featured_channel: IForum;
}
