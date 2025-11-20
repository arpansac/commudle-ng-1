import { IQuestion } from 'apps/shared-models/question.model';

export interface IDataFormEntityResponseValue {
  id: number;
  question_id: number;
  response_text: string;
  created_at: Date;
  question: IQuestion;
}
