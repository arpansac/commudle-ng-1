import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IRoundMentorSlot } from '@commudle/shared-models';
import { API_ROUTES } from './api-routes.constant';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class RoundMentorSlotService {
  constructor(private http: HttpClient, private baseApiService: BaseApiService) {}

  indexByRoundMentor(roundId: number, hackathonJudgeId: number): Observable<IRoundMentorSlot[]> {
    const params = new HttpParams().set('round_id', roundId).set('hackathon_judge_id', hackathonJudgeId);
    return this.http.get<IRoundMentorSlot[]>(
      this.baseApiService.getRoute(API_ROUTES.ROUND_MENTOR_SLOTS.INDEX_BY_ROUND_MENTOR),
      { params },
    );
  }

  create(data: {
    round_mentor_slot_rule_id?: number;
    slot_uuid?: string;
    round_id: number;
    round_mentor_slot: {
      hackathon_judge_id: number;
      starts_at?: string;
      ends_at?: string;
      status?: string;
    };
  }): Observable<IRoundMentorSlot> {
    return this.http.post<IRoundMentorSlot>(this.baseApiService.getRoute(API_ROUTES.ROUND_MENTOR_SLOTS.CREATE), data);
  }
}
