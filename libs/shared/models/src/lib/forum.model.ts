import { IChannelCategory } from './channel-category.model';
import { ICommunityChannel } from './community-channel.model';

// export type IForum = ICommunityChannel;

export interface IForum extends ICommunityChannel {
  category: IChannelCategory;
}
