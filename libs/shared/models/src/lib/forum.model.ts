import { ICommunityChannel } from './community-channel.model';

// export type IForum = ICommunityChannel;

export interface IForum extends ICommunityChannel {
  category: string;
}
