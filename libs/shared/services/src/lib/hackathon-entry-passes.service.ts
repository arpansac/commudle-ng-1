import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { API_ROUTES } from './api-routes.constant';
import { IHackathonEntryPass } from '@commudle/shared-models';

@Injectable({
  providedIn: 'root',
})
export class HackathonEntryPassesService {
  constructor(private http: HttpClient, private apiRoutesService: BaseApiService) {}

  scanEntryPass(hackathonId: number, entryPassCode: string): Observable<IHackathonEntryPass> {
    const params = new HttpParams().set('hackathon_id', hackathonId).set('entry_pass_code', entryPassCode);
    return this.http.get<IHackathonEntryPass>(
      this.apiRoutesService.getRoute(API_ROUTES.HACKATHON_ENTRY_PASSES.SCAN_ENTRY_PASS),
      { params },
    );
  }

  updateAttendance(hackathonId: number, entryPassCode: string, attendance: boolean): Observable<IHackathonEntryPass> {
    const params = new HttpParams()
      .set('hackathon_id', hackathonId)
      .set('entry_pass_code', entryPassCode)
      .set('attendance', attendance);
    return this.http.put<IHackathonEntryPass>(
      this.apiRoutesService.getRoute(API_ROUTES.HACKATHON_ENTRY_PASSES.UPDATE_ATTENDANCE),
      {},
      { params },
    );
  }

  attendanceStats(hackathonId: number): Observable<any> {
    const params = new HttpParams().set('hackathon_id', hackathonId);
    return this.http.get<any>(this.apiRoutesService.getRoute(API_ROUTES.HACKATHON_ENTRY_PASSES.ATTENDANCE_STATS), {
      params,
    });
  }
}
