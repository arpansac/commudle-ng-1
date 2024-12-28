import { IUser } from './user.model';

export interface IProfanity {
  id: number;
  word: string;
  domain: string;
  user: IUser;
  has_word: boolean;
}
