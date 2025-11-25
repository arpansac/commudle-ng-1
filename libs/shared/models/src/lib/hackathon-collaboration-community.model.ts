import { ICommunity } from './community.model';
import { IUser } from './user.model';
import { IHackathon } from './hackathon.model';

export interface IHackathonCollaborationCommunity {
  id: number;
  hackathon: IHackathon;
  approved: boolean;
  community: ICommunity;
  created_by: IUser;
  status: EHackathonCollaborationCommunityStatus;
  approval_token: string;
}

export enum EHackathonCollaborationCommunityStatus {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PENDING = 'pending',
}
