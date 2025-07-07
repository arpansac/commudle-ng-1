import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IEvent } from 'apps/shared-models/event.model';
import { API_ROUTES, BaseApiService } from '@commudle/shared-services';

@Injectable({
  providedIn: 'root',
})
export class EventDetailsResolver implements Resolve<IEvent> {
  constructor(private http: HttpClient, private apiRoutesService: BaseApiService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IEvent> {
    // if organizer communities are already fetched then bring it from there, else fetch the communities and then filter from the list
    const params = new HttpParams()
      .set('event_id', route.params.event_id)
      .set('community_id', route.parent.params.community_id);
    return this.http.get<IEvent>(this.apiRoutesService.getRoute(API_ROUTES.EVENTS.GET), { params: params });
  }
}
