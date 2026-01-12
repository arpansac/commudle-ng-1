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
  metadata?: ISlotMetadata;
}

export interface ISlotMetadata {
  slots: ISlot[];
}

export interface ISlot {
  uuid: string;
  status: string;
  start_time: string;
  end_time: string;
}
