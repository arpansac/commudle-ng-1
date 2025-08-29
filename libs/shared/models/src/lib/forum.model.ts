import { IChannelCategory } from './channel-category.model';
import { ICommunityChannel } from './community-channel.model';

// export type IForum = ICommunityChannel;

export interface IForum extends ICommunityChannel {
  category: IChannelCategory;
  last_message: string;
  discussions_count: number;
  replies_count: number;
}
