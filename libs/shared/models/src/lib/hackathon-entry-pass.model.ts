export interface IHackathonEntryPass {
  id: number;
  attendance: boolean;
  checkin_time: Date;
  entry_pass_code: string;
  created_at: Date;
  updated_at: Date;
  hackathon_id: number;
  hackathon_user_response_id: number;
}
