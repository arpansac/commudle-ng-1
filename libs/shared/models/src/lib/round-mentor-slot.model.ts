import { IHackathonJudge } from './hackathon-judge.model';
import { IRoundMentorSlotBooking } from './round-mentor-slot-booking.model';

export interface IRoundMentorSlot {
  id: number;
  starts_at: Date;
  ends_at: Date;
  status: ERoundMentorSlotStatus;
  hackathon_judge_id: number;
  round_id: number;
  round_mentor_slot_bookings: IRoundMentorSlotBooking[];
  hackathon_judge: IHackathonJudge;
}

export enum ERoundMentorSlotStatus {
  OPEN = 'open',
  CANCELLED_BY_MENTOR = 'cancelled_by_mentor',
  CANCELLED = 'cancelled',
}
