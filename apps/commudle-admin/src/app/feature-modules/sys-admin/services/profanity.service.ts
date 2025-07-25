import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPaginationCount, IProfanity } from '@commudle/shared-models';
import { API_ROUTES, BaseApiService } from '@commudle/shared-services';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfanityService {
  constructor(private http: HttpClient, private apiRoutesService: BaseApiService) {}

  indexProfanity(has_word: string, page?: number, count?: number): Observable<IPaginationCount<IProfanity>> {
    let params = new HttpParams();
    if (page) {
      params = params.append('page', page);
    }
    if (count) {
      params = params.append('count', count);
    }

    if (has_word) {
      params = params.append('has_word', has_word);
    }
    return this.http.get<IPaginationCount<IProfanity>>(this.apiRoutesService.getRoute(API_ROUTES.PROFANITY.INDEX), {
      params,
    });
  }

  createProfanityTerm(formData): Observable<IProfanity> {
    return this.http.post<IProfanity>(this.apiRoutesService.getRoute(API_ROUTES.PROFANITY.CREATE), {
      profanity: formData,
    });
  }
}
