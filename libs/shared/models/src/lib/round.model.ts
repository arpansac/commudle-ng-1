export interface IRound {
  id: number;
  name: string;
  slug: string;
  date: string;
  description: string;
  parent_type: string;
  parent_id: number;
  user_id: number;
  order: number;
  channel_id: number;
  marking_criteria: IMarkingCriteria[];
  round_type: ERoundType;
  end_date: string;
  has_marking_criteria: boolean;
}

export enum ERoundType {
  GENERAL = 'general',
  PPT_SUBMISSION = 'ppt_submission',
  PROJECT_SUBMISSION = 'project_submission',
  PROJECT_UPDATE_SUBMISSION = 'project_update_submission',
}

export interface IMarkingCriteria {
  text: string;
  min: number;
  max: number;
}
