import { ICampaignType } from './campaign-type.model';

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
  campaign_type: ICampaignType;
  //  campaign_asset_id: nil,
  created_at: Date;
  updated_at: Date;
}

export enum ECampaignStatus {
  DRAFT = 'draft',
  COMPLETE = 'complete',
  INCOMPLETE = 'incomplete',
}
