import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from './api-routes.constant';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmailerPreviewService {
  constructor(private http: HttpClient, private apiRoutesService: BaseApiService) {}

  communityEmailPreview(formData, communityId): Observable<any> {
    return this.http.post<any>(this.apiRoutesService.getRoute(API_ROUTES.EMAIL_PREVIEWS.COMMUNITY_EMAILS.EMAIL), {
      email_form: formData,
      community_id: String(communityId),
    });
  }

  hackathonRegistrationEmail(formData, hackathonId): Observable<any> {
    return this.http.post<any>(
      this.apiRoutesService.getRoute(API_ROUTES.EMAIL_PREVIEWS.HACKATHON_EMAILS.STATUS_FILTER_GENERAL_EMAIL),
      {
        email_form: formData,
        community_id: String(hackathonId),
      },
    );
  }
}
