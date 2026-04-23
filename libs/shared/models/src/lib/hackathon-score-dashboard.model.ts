export interface IEvaluatorScore {
  evaluator_name: string;
  evaluator_photo: string;
  total_score: number;
  round_name: string;
  criteria: { text: string; score: number }[];
}

export interface IRoundScores {
  round_id: number;
  round_name: string;
  evaluator_scores: IEvaluatorScore[];
  avg_score: number;
  best_score: number;
}

export interface ITeamRow {
  rank: number;
  team_id: number;
  team_name: string;
  team_initials: string;
  members_count: number;
  rounds: IRoundScores[];
  total_score: number;
  avg_score: number;
  total_evaluations: number;
  expanded: boolean;
}
