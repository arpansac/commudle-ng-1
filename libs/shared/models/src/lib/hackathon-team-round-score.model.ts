export interface IHackathonTeamRoundScore {
  id: number;
  evaluator_id: number;
  hackathon_team_id: number;
  round_id: number;
  score: any;
  created_at: Date;
  updated_at: Date;
}

export interface IBulkAssignmentResponse {
  created_assignments: IHackathonTeamRoundScore[];
  errors: string[];
  total_created: number;
}
