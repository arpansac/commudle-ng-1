import { IHackathonTeamRoundScore } from './hackathon-team-round-score.model';
import { IHackathonTeam } from './hackathon-team.model';

export interface IRoundMentorSlotBooking {
  id: number;
  round_mentor_slot_id: number;
  hackathon_team_id: number;
  hackathon_team: IHackathonTeam;
  hackathon_team_round_score: IHackathonTeamRoundScore;
}
