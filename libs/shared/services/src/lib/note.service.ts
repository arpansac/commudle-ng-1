import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { INote, EDbModels } from '@commudle/shared-models';
import { Observable } from 'rxjs';
import { API_ROUTES } from './api-routes.constant';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class NoteService {
  constructor(private http: HttpClient, private baseApiService: BaseApiService) {}

  createNote(
    formData,
    parentType: EDbModels,
    parentId: number | string,
    entityType?: EDbModels,
    entityId?: number | string,
    metadata?: JSON,
  ): Observable<INote> {
    let params = new HttpParams().set('parent_id', parentId).set('parent_type', parentType);
    if (entityId && entityType) {
      params = params.set('entity_id', entityId).set('entity_type', entityType);
    }
    if (metadata) {
      params = params.set('metadata', JSON.stringify(metadata));
    }
    return this.http.post<INote>(this.baseApiService.getRoute(API_ROUTES.NOTE.CREATE), formData, {
      params,
    });
  }

  updateNote(formData, noteId, parentType: EDbModels, parentId): Observable<INote> {
    const params = new HttpParams().set('note_id', noteId).set('parent_id', parentId).set('parent_type', parentType);
    return this.http.put<INote>(this.baseApiService.getRoute(API_ROUTES.NOTE.UPDATE), formData, {
      params,
    });
  }

  indexNotes(parentId: number | string, parentType: EDbModels): Observable<INote[]> {
    const params = new HttpParams().set('parent_id', parentId).set('parent_type', parentType);
    return this.http.get<INote[]>(this.baseApiService.getRoute(API_ROUTES.NOTE.INDEX), { params });
  }

  destroyNote(noteId): Observable<boolean> {
    const params = new HttpParams().set('note_id', noteId);
    return this.http.delete<boolean>(this.baseApiService.getRoute(API_ROUTES.NOTE.DELETE), { params });
  }

  // PUBLIC API
  pIndexNotes(parentId: number | string, parentType: EDbModels): Observable<INote[]> {
    const params = new HttpParams().set('parent_id', parentId).set('parent_type', parentType);
    return this.http.get<INote[]>(this.baseApiService.getRoute(API_ROUTES.NOTE.PUBLIC.INDEX), { params });
  }
}
