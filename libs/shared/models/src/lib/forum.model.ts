import { IChannelCategory } from './channel-category.model';
import { ICommunityChannel } from './community-channel.model';

// export type IForum = ICommunityChannel;

export interface IForum extends ICommunityChannel {
  channel_category: IChannelCategory;
  last_message: string;
  total_discussions: number;
  total_replies: number;
}
