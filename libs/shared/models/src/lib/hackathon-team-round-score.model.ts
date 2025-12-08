export interface IHackathonTeamRoundScore {
  id: number;
  evaluator_id: number;
  hackathon_team_id: number;
  round_id: number;
  score: any;
  created_at: Date;
  updated_at: Date;
  status: EHackathonTeamRoundScoreStatus;
}

export enum EHackathonTeamRoundScoreStatus {
  NOT_CREATED = 'not_created',
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
}
