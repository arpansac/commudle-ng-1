import { IUser } from './user.model';

export interface INote {
  id: number;
  text: string;
  parent_type: string;
  parent_id: number;
  created_by: IUser;
  created_at: Date;
}
