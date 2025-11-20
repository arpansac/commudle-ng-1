import { IHackathonPrize } from './hackathon-prize.model';
import { IHackathonProblemStatement } from './hackathon-problem-statement.model';

export interface IHackathonTrack {
  id: number;
  name: string;
  slug: string;
  description: string;
  problem_statement?: string; // Legacy field, kept for backward compatibility
  hackathon_id: number;
  hackathon_prizes?: IHackathonPrize[];
  hackathon_problem_statements?: IHackathonProblemStatement[];
}
