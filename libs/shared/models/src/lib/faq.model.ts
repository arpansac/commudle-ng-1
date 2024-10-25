export interface IFaq {
  question: string;
  answer: string;
  id?: number;
  parent_type?: string;
  parent_id?: number;
  user_id?: number;
}
