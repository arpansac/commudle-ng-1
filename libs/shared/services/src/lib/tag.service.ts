import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from './api-routes.constant';
import { BaseApiService } from './base-api.service';
import { IPaginationCount, ITag } from '@commudle/shared-models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  constructor(private http: HttpClient, private baseApiService: BaseApiService) {}

  index(search: string, ai_corrected?: boolean): Observable<IPaginationCount<ITag>> {
    let params = new HttpParams().set('q', search);
    if (ai_corrected) {
      params = params.set('ai_corrected', ai_corrected);
    }
    return this.http.get<IPaginationCount<ITag>>(this.baseApiService.getRoute(API_ROUTES.TAGS.PUBLIC.INDEX), {
      params,
    });
  }
}
