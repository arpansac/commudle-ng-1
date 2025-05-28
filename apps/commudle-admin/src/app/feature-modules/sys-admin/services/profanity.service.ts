import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IProfanity } from '@commudle/shared-models';
import { API_ROUTES } from 'apps/shared-services/api-routes.constants';
import { ApiRoutesService } from 'apps/shared-services/api-routes.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfanityService {
  constructor(private http: HttpClient, private apiRoutesService: ApiRoutesService) {}

  indexProfanity(page?: number, count?: number): Observable<IProfanity[]> {
    let params = new HttpParams();
    if (page) {
      params = params.append('page', String(page));
    }
    if (count) {
      params = params.append('count', String(count));
    }
    return this.http.get<IProfanity[]>(this.apiRoutesService.getRoute(API_ROUTES.PROFANITY.INDEX), { params });
  }

  createProfanityTerm(formData): Observable<IProfanity> {
    return this.http.post<IProfanity>(this.apiRoutesService.getRoute(API_ROUTES.PROFANITY.CREATE), {
      profanity: formData,
    });
  }
}
