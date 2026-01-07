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

  hackathonInviteRegistrationEmailPreview(formData, hackathonId): Observable<any> {
    return this.http.post<any>(
      this.apiRoutesService.getRoute(API_ROUTES.EMAIL_PREVIEWS.HACKATHON_EMAILS.INVITE_REGISTRATIONS_EMAIL),
      {
        email_form: formData,
        hackathon_id: String(hackathonId),
      },
    );
  }

  hackathonWinnerAnnouncementEmailPreview(formData, hackathonId): Observable<any> {
    return this.http.post<any>(
      this.apiRoutesService.getRoute(API_ROUTES.EMAIL_PREVIEWS.HACKATHON_EMAILS.WINNER_ANNOUNCEMENT_EMAIL),
      {
        email_form: formData,
        hackathon_id: String(hackathonId),
      },
    );
  }

  hackathonStatusFilterEmailPreview(formData, hackathonId): Observable<any> {
    return this.http.post<any>(
      this.apiRoutesService.getRoute(API_ROUTES.EMAIL_PREVIEWS.HACKATHON_EMAILS.STATUS_FILTER_GENERAL_EMAIL),
      {
        email_form: formData,
        hackathon_id: String(hackathonId),
      },
    );
  }

  hackathonRoundEmailPreview(formData, hackathonId): Observable<any> {
    return this.http.post<any>(
      this.apiRoutesService.getRoute(API_ROUTES.EMAIL_PREVIEWS.HACKATHON_EMAILS.ROUND_GENERAL_EMAIL),
      {
        email_form: formData,
        hackathon_id: String(hackathonId),
      },
    );
  }

  hackathonOverallRoundSelectionEmailPreview(formData, hackathonId): Observable<any> {
    return this.http.post<any>(
      this.apiRoutesService.getRoute(API_ROUTES.EMAIL_PREVIEWS.HACKATHON_EMAILS.OVERALL_ROUND_SELECTION_UPDATE_EMAIL),
      {
        email_form: formData,
        hackathon_id: String(hackathonId),
      },
    );
  }

  hackathonTeamIndividualGeneralEmailPreview(formData, hackathonTeamId): Observable<any> {
    return this.http.post<any>(
      this.apiRoutesService.getRoute(
        API_ROUTES.EMAIL_PREVIEWS.HACKATHON_EMAILS.HACKATHON_TEAM_INDIVIDUAL_GENERAL_EMAIL,
      ),
      {
        email_form: formData,
        hackathon_team_id: hackathonTeamId,
      },
    );
  }

  hackathonSendTeamStatusEmailByFilterEmailPreview(hackathonId, registrationStatus): Observable<any> {
    return this.http.post<any>(
      this.apiRoutesService.getRoute(
        API_ROUTES.EMAIL_PREVIEWS.HACKATHON_EMAILS.HACKATHON_SEND_TEAM_STATUS_EMAIL_BY_FILTER,
      ),
      {
        hackathon_id: hackathonId,
        team_registration_status: registrationStatus,
      },
    );
  }

  hackathonTeamRsvpEmailPreview(formData, hackathonId): Observable<any> {
    return this.http.post<any>(
      this.apiRoutesService.getRoute(API_ROUTES.EMAIL_PREVIEWS.HACKATHON_EMAILS.HACKATHON_TEAM_RSVP_EMAIL),
      {
        email_form: formData,
        hackathon_id: hackathonId,
      },
    );
  }

  hackathonEntryPassEmailPreview(formData, hackathonId): Observable<any> {
    return this.http.post<any>(
      this.apiRoutesService.getRoute(API_ROUTES.EMAIL_PREVIEWS.HACKATHON_EMAILS.HACKATHON_ENTRY_PASS_EMAIL),
      {
        email_form: formData,
        hackathon_id: String(hackathonId),
      },
    );
  }
}
