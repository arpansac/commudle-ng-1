export interface IHackathonProblemStatement {
  id?: number;
  title: string;
  max_teams_limit: number;
  hackathon_track_id?: number;
  display_id?: string;
  selected_team_count?: number;
  teams_remaining_count?: number;
  can_team_select?: boolean;
}
