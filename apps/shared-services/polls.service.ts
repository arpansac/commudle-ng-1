import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiRoutesService } from './api-routes.service';
import { API_ROUTES } from './api-routes.constants';
import { IPoll } from 'apps/shared-models/poll.model';
import { EDbModels } from '@commudle/shared-models';

@Injectable({
  providedIn: 'root',
})
export class PollsService {
  constructor(private http: HttpClient, private apiRoutesService: ApiRoutesService) {}

  index(pollableType: EDbModels, pollableId: number): Observable<{ polls: IPoll[] }> {
    return this.http.get<{ polls: IPoll[] }>(this.apiRoutesService.getRoute(API_ROUTES.POLLS.INDEX), {
      params: {
        pollable_type: pollableType,
        pollable_id: pollableId,
      },
    });
  }

  create(pollData: any, pollableType: EDbModels, pollableId: number): Observable<IPoll> {
    return this.http.post<IPoll>(this.apiRoutesService.getRoute(API_ROUTES.POLLS.CREATE), {
      poll: pollData,
      pollable_type: pollableType,
      pollable_id: pollableId,
    });
  }

  delete(pollId: number, pollableType: EDbModels, pollableId: number): Observable<any> {
    const params = new HttpParams()
      .set('poll_id', pollId)
      .set('pollable_type', pollableType)
      .set('pollable_id', pollableId);
    return this.http.delete(this.apiRoutesService.getRoute(API_ROUTES.POLLS.DELETE), { params });
  }

  submitPoll(pollId: number, pollData: any): Observable<any> {
    const params = new HttpParams().set('poll_id', pollId);
    return this.http.post(
      this.apiRoutesService.getRoute(API_ROUTES.POLLS.PUBLIC.SUBMIT),
      {
        poll: pollData,
      },
      { params },
    );
  }
}
