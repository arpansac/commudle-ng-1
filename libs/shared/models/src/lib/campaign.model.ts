import { IUser } from './user.model';
import { ICampaignType } from './campaign-type.model';
import { ICampaignAsset } from './campaign-asset.model';

export interface ICampaign {
  id: number;
  name: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  start_time: Date;
  end_time: Date;
  budget: number;
  currency_type: string;
  status: ECampaignStatus;
  campaign_type_id: number;
  campaign_type: ICampaignType;
  created_at: Date;
  updated_at: Date;
  user: IUser;
  campaign_assets: ICampaignAsset[];
}

export enum ECampaignStatus {
  INCOMPLETE = 'incomplete',
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CHANGES_REQUIRED = 'changes_required',
  LIVE = 'live',
  COMPLETE = 'complete',
}
