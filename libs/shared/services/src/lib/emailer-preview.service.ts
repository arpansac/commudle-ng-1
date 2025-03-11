import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from './api-routes.constant';
import { ApiRoutesService } from 'apps/shared-services/api-routes.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmailerPreviewService {
  constructor(private http: HttpClient, private apiRoutesService: ApiRoutesService) {}

  previewEmail(formData, communityId): Observable<any> {
    return this.http.post<any>(this.apiRoutesService.getRoute(API_ROUTES.EMAIL_PREVIEWS.COMMUNITY_EMAILS.EMAIL), {
      email_form: formData,
      community_id: String(communityId),
    });
  }
}
