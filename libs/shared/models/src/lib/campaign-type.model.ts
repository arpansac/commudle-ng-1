import { IUser } from './user.model';

export interface ICampaignType {
  name: string;
  description: string;
  id: number;
  user: IUser;
  active: boolean;
}
