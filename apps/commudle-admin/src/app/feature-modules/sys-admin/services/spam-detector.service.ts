import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPaginationCount, ISpamDetector } from '@commudle/shared-models';
import { API_ROUTES, BaseApiService } from '@commudle/shared-services';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpamDetectorService {
  constructor(private http: HttpClient, private apiRoutesService: BaseApiService) {}

  getSpamResult(
    page: number,
    count: number,
    isSpam: boolean | string,
    isSpamDecision: boolean | string,
  ): Observable<IPaginationCount<ISpamDetector>> {
    let params = new HttpParams().set('page', page).set('count', count.toString());

    if (isSpam === true || isSpam === false) {
      params = params.set('is_spam', isSpam.toString());
    }
    if (isSpamDecision === true || isSpamDecision === false) {
      params = params.set('is_spam_decision', isSpamDecision.toString());
    }

    return this.http.get<IPaginationCount<ISpamDetector>>(
      this.apiRoutesService.getRoute(API_ROUTES.SPAM_DETECTOR.INDEX),
      {
        params,
      },
    );
  }

  updateSpamDetector(value, id): Observable<ISpamDetector> {
    return this.http.put<ISpamDetector>(this.apiRoutesService.getRoute(API_ROUTES.SPAM_DETECTOR.UPDATE), {
      is_spam_decision: value,
      spam_detector_id: id,
    });
  }
}
