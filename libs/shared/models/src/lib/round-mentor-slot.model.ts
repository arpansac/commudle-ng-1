export interface IRoundMentorSlot {
  id: number;
  starts_at: string;
  ends_at: string;
  status: ERoundMentorSlotStatus;
  hackathon_judge_id: number;
  round_id: number;
}

export enum ERoundMentorSlotStatus {
  OPEN = 'open',
  CANCELLED_BY_MENTOR = 'cancelled_by_mentor',
  CANCELLED = 'cancelled',
}
