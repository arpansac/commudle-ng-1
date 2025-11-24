import { IAttachedFile } from './attached-file.model';
import { IUser } from './user.model';
import { IUserMessage } from './user-message.model';
import { EDbModels } from './db-models.enum';
import { ICommunity } from './community.model';
import { IHackathon } from './hackathon.model';

export interface ICommunityChannel {
  id: number;
  slug: string;
  user: IUser;
  kommunity_id: number;
  name: string;
  description: string;
  group_name: string;
  join_token: string;
  is_private: boolean;
  is_readonly: boolean;
  logo: IAttachedFile;
  my_roles: any[];
  member_count: number;
  messages_count?: number;
  display_type: string;
  messages_count_in_three_months?: number;
  kommunity?: {
    id: number;
    name: string;
  };
  latest_message?: IUserMessage;
  discussion_id: number;
  members_count: number;
  default: boolean;
  parent_type: EDbModels;
  parent: ICommunity | IHackathon;
}

export interface IGroupedChannels {
  [groupName: string]: ICommunityChannel[];
}

export interface ICommunityChannels {
  community_channels: ICommunityChannel[];
}

export enum EDiscussionType {
  CHANNEL = 'channel',
  FORUM = 'forum',
}
