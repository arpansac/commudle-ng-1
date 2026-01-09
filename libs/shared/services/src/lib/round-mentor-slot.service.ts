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

  // index(roundId: number): Observable<IRoundMentorSlot[]> {
  //   const params = new HttpParams().set('round_id', roundId);
  //   return this.http.get<IRoundMentorSlot[]>(this.baseApiService.getRoute(API_ROUTES.ROUND_MENTOR_SLOT.INDEX), {
  //     params,
  //   });
  // }

  // show(slotId: number): Observable<IRoundMentorSlot> {
  //   const params = new HttpParams().set('slot_id', slotId);
  //   return this.http.get<IRoundMentorSlot>(this.baseApiService.getRoute(API_ROUTES.ROUND_MENTOR_SLOT.SHOW), {
  //     params,
  //   });
  // }

  // create(roundId: number, mentorId: number, formData: any): Observable<IRoundMentorSlot> {
  //   const params = new HttpParams().set('round_id', roundId).set('mentor_id', mentorId);
  //   return this.http.post<IRoundMentorSlot>(
  //     this.baseApiService.getRoute(API_ROUTES.ROUND_MENTOR_SLOT.CREATE),
  //     formData,
  //     { params },
  //   );
  // }

  // update(slotId: number, formData: any): Observable<IRoundMentorSlot> {
  //   const params = new HttpParams().set('slot_id', slotId);
  //   return this.http.put<IRoundMentorSlot>(
  //     this.baseApiService.getRoute(API_ROUTES.ROUND_MENTOR_SLOT.UPDATE),
  //     formData,
  //     { params },
  //   );
  // }

  // destroy(slotId: number): Observable<boolean> {
  //   const params = new HttpParams().set('slot_id', slotId);
  //   return this.http.delete<boolean>(this.baseApiService.getRoute(API_ROUTES.ROUND_MENTOR_SLOT.DELETE), { params });
  // }
}
