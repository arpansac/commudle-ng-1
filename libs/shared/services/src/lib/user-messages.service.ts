import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { API_ROUTES } from './api-routes.constant';
import { IUserMessage } from '@commudle/shared-models';

@Injectable({
  providedIn: 'root',
})
export class UserMessagesService {
  constructor(private http: HttpClient, private baseApiService: BaseApiService) {}

  showUserMessage(userMessageId: number | string): Observable<IUserMessage> {
    const params = new HttpParams().set('user_message_id', userMessageId);
    return this.http.get<IUserMessage>(this.baseApiService.getRoute(API_ROUTES.USER_MESSAGES.SHOW_USER_MESSAGE), {
      params,
    });
  }
}
