import { IAttachedFile } from './attached-file.model';

export interface IHackathonJudge {
  id: number;
  name: string;
  about: string;
  company: string;
  email: string;
  linkedin: string;
  twitter: string;
  website: string;
  designation: string;
  username: string;
  judge_user_id: number;
  photo?: IAttachedFile;
  invite_status: EJudgeInvitationStatus;
  judge_type: EHackathonJudgeType;
  meeting_location: string;
}

export enum EJudgeInvitationStatus {
  INVITED = 'invited',
  ACCEPTED = 'accepted',
  REMOVED = 'removed',
  REJECTED = 'rejected',
}

export enum EHackathonJudgeType {
  JUDGE = 'judge',
  SPEAKER = 'speaker',
  MENTOR = 'mentor',
}
