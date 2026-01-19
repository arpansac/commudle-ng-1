import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IRoundMentorSlotBooking } from '@commudle/shared-models';
import { BaseApiService } from './base-api.service';
import { API_ROUTES } from './api-routes.constant';

@Injectable({
  providedIn: 'root',
})
export class RoundMentorSlotBookingService {
  constructor(private http: HttpClient, private baseApiService: BaseApiService) {}

  createBooking(
    roundMentorSlotRuleId: number,
    hackathonTeamId: number,
    roundMentorSlotId: number,
    hackathonJudgeId: number,
  ): Observable<IRoundMentorSlotBooking> {
    return this.http.post<IRoundMentorSlotBooking>(
      this.baseApiService.getRoute(API_ROUTES.ROUND_MENTOR_SLOT_BOOKINGS.CREATE),
      {
        round_mentor_slot_rule_id: roundMentorSlotRuleId,
        hackathon_team_id: hackathonTeamId,
        round_mentor_slot_id: roundMentorSlotId,
        hackathon_judge_id: hackathonJudgeId,
      },
    );
  }
}
