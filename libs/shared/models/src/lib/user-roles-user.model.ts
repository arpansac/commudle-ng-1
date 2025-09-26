import { ICommunity } from './community.model';
import { IUserRole } from './user-role.model';
import { IUser } from './user.model';

export interface IUserRolesUser {
  id: number;
  user_role: IUserRole;
  user: IUser;
  active: boolean;
  parent_id: number;
  parent_type: string;
  parent_name: string;
  status: EUserRolesUserStatus;
  community?: ICommunity;
  role_designation?: string;
  agg_user_community_engagement: IAggUserCommunityEngagement;
  community_score: number;
}

export interface IAggUserCommunityEngagement {
  overall_attendance_rate: number;
  total_channel_messages: number;
  total_event_registrations: number;
  total_event_speaker_registrations: number;
  total_event_speaker_sessions: number;
  total_hackathon_registrations: number;
  total_volunteered_events: number;
}

export enum EUserRolesUserStatus {
  INVITED = 'invited',
  ACCEPTED = 'accepted',
  REMOVED = 'removed',
  JOINED_BY_TOKEN = 'joined_by_token',
  AUTO_JOINED = 'auto_joined',
}

export interface IUserRolesUsers {
  user_roles_users: IUserRolesUser[];
  page: number;
  count: number;
  total: number;
}
