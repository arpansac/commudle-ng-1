export interface IRoundMentorSlotRule {
  id: number;
  booking_open: boolean;
  ends_at: string;
  max_teams_per_slot: number;
  slot_length: number;
  starts_at: string;
  created_at: string;
  updated_at: string;
  created_by_id: number;
  round_id: number;
}
