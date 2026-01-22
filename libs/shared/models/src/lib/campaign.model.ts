import { IUser } from './user.model';
import { ICampaignType } from './campaign-type.model';
import { ICampaignAsset } from './campaign-asset.model';
import { IPurchaseOrder } from './purchase-order.model';
import { INote } from './note.model';

export interface ICampaign {
  id: number;
  name: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  start_time: Date;
  end_time: Date;
  start_date: Date;
  end_date: Date;
  budget: number;
  currency_type: string;
  campaign_type_id: number;
  created_at: Date;
  updated_at: Date;
  tags: string[];
  main_newsletter_id: number;
  start_at: string;
  end_at: string;
  status: ECampaignStatus;
  locations: [];
  communities: [];

  user: IUser;
  campaign_type: ICampaignType;
  campaign_assets: ICampaignAsset[];
  purchase_order?: IPurchaseOrder;
  unapproved_reasons?: INote[];
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
