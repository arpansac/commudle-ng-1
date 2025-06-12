import { IUser } from './user.model';

export interface IInterestedUsers {
  users: IUser[];
  total_count: number;
}
