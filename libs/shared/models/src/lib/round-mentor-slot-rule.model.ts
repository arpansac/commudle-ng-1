export interface IRoundMentorSlotRule {
  id: number;
  booking_open: boolean;
  ends_at: Date;
  max_teams_per_slot: number;
  slot_length: number;
  starts_at: Date;
  created_by_id: number;
  round_id: number;
  total_slots: number;
  slot_times: { starts_at: Date; ends_at: Date }[];
  only_admin_assigns_teams: boolean;
  mentor_manages_teams: boolean;
  teams_choose_slots: boolean;
}
