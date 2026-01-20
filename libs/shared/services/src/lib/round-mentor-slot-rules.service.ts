import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IRoundMentorSlotRule } from '@commudle/shared-models';
import { BaseApiService } from './base-api.service';
import { API_ROUTES } from './api-routes.constant';

@Injectable({
  providedIn: 'root',
})
export class RoundMentorSlotRulesService {
  constructor(private http: HttpClient, private baseApiService: BaseApiService) {}

  create(roundId: number, data: Partial<IRoundMentorSlotRule>): Observable<IRoundMentorSlotRule> {
    const params = new HttpParams().set('round_id', roundId);
    return this.http.post<IRoundMentorSlotRule>(
      this.baseApiService.getRoute(API_ROUTES.ROUND_MENTOR_SLOT_RULES.CREATE),
      { round_mentor_slot_rule: data },
      { params },
    );
  }

  update(roundId: number, ruleId: number, data: Partial<IRoundMentorSlotRule>): Observable<IRoundMentorSlotRule> {
    const params = new HttpParams().set('round_id', roundId).set('round_mentor_slot_rule_id', ruleId);
    return this.http.put<IRoundMentorSlotRule>(
      this.baseApiService.getRoute(API_ROUTES.ROUND_MENTOR_SLOT_RULES.UPDATE),
      { round_mentor_slot_rule: data },
      { params },
    );
  }

  showByRound(roundId: number): Observable<IRoundMentorSlotRule> {
    const params = new HttpParams().set('round_id', roundId);
    return this.http.get<IRoundMentorSlotRule>(
      this.baseApiService.getRoute(API_ROUTES.ROUND_MENTOR_SLOT_RULES.SHOW_BY_ROUND),
      {
        params,
      },
    );
  }
}
