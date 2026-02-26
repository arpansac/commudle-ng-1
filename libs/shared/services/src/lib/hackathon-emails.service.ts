import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { API_ROUTES } from './api-routes.constant';

@Injectable({
  providedIn: 'root',
})
export class HackathonEmailsService {
  constructor(private http: HttpClient, private baseApiService: BaseApiService) {}

  sendMentorMessageToTeams(
    hackathonId: number | string,
    roundId: number,
    mentorIds: number[],
    subject: string,
    message: string,
  ): Observable<boolean> {
    return this.http.post<boolean>(
      this.baseApiService.getRoute(API_ROUTES.HACKATHON_EMAILS.SEND_MENTOR_MESSAGE_TO_TEAMS),
      {
        hackathon_id: hackathonId,
        round_id: roundId,
        mentor_ids: mentorIds,
        subject: subject,
        message: message,
      },
    );
  }
}
