import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ELabPublishStatus, ILab, IPaginationCount } from '@commudle/shared-models';
import { API_ROUTES, BaseApiService } from '@commudle/shared-services';

@Injectable({
  providedIn: 'root',
})
export class SysAdminLabsService {
  constructor(private http: HttpClient, private apiRoutesService: BaseApiService) {}

  getAll(page?: number, count?: number, labStatus?: ELabPublishStatus): Observable<IPaginationCount<ILab>> {
    let params = new HttpParams();
    if (page) {
      params = params.append('page', page);
    }

    if (count) {
      params = params.append('count', count);
    }

    if (labStatus) {
      params = params.append('lab_status', labStatus);
    }

    return this.http.get<IPaginationCount<ILab>>(this.apiRoutesService.getRoute(API_ROUTES.LABS.ADMIN.INDEX), {
      params,
    });
  }

  updatePublishStatus(labId, publishStatus): Observable<boolean> {
    return this.http.put<boolean>(this.apiRoutesService.getRoute(API_ROUTES.LABS.ADMIN.UPDATE_PUBLISH_STATUS), {
      lab_id: labId,
      publish_status: publishStatus,
    });
  }
}
