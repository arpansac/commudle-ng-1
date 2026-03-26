import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from './api-routes.constant';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { EDbModels, EHmsRoomMode, IHmsHls } from '@commudle/shared-models';

@Injectable({
  providedIn: 'root',
})
export class HmsRoomService {
  constructor(private http: HttpClient, private baseApiService: BaseApiService) {}

  startHls(streamableId: number, streamableType: EDbModels, singleFilePerLayer: boolean): Observable<IHmsHls> {
    return this.http.post<IHmsHls>(
      this.baseApiService.getRoute(API_ROUTES.EMBEDDED_VIDEO_STREAMS.HMS_ROOMS.START_HLS),
      {
        streamable_id: streamableId,
        streamable_type: streamableType,
        single_file_per_layer: singleFilePerLayer,
      },
    );
  }

  stopHls(streamableId: number, streamableType: EDbModels): Observable<IHmsHls> {
    return this.http.post<IHmsHls>(this.baseApiService.getRoute(API_ROUTES.EMBEDDED_VIDEO_STREAMS.HMS_ROOMS.STOP_HLS), {
      streamable_id: streamableId,
      streamable_type: streamableType,
    });
  }

  restartHls(streamableId: number, streamableType: EDbModels, singleFilePerLayer: boolean): Observable<IHmsHls> {
    return this.http.post<IHmsHls>(
      this.baseApiService.getRoute(API_ROUTES.EMBEDDED_VIDEO_STREAMS.HMS_ROOMS.RESTART_HLS),
      {
        streamable_id: streamableId,
        streamable_type: streamableType,
        single_file_per_layer: singleFilePerLayer,
      },
    );
  }

  getPlaybackUrl(streamableId: number, streamableType: EDbModels): Observable<IHmsHls> {
    const params = new HttpParams().set('streamable_id', streamableId).set('streamable_type', streamableType);
    return this.http.get<IHmsHls>(
      this.baseApiService.getRoute(API_ROUTES.EMBEDDED_VIDEO_STREAMS.HMS_ROOMS.GET_PLAYBACK_URL),
      {
        params,
      },
    );
  }

  updateIsLive(streamableId: number, streamableType: EDbModels, isLive: boolean): Observable<{ is_live: boolean }> {
    return this.http.post<{ is_live: boolean }>(
      this.baseApiService.getRoute(API_ROUTES.EMBEDDED_VIDEO_STREAMS.HMS_ROOMS.UPDATE_IS_LIVE),
      {
        streamable_id: streamableId,
        streamable_type: streamableType,
        is_live: isLive,
      },
    );
  }

  updateMode(streamableId: number, streamableType: EDbModels, mode: EHmsRoomMode): Observable<{ mode: EHmsRoomMode }> {
    return this.http.post<{ mode: EHmsRoomMode }>(
      this.baseApiService.getRoute(API_ROUTES.EMBEDDED_VIDEO_STREAMS.HMS_ROOMS.UPDATE_MODE),
      {
        streamable_id: streamableId,
        streamable_type: streamableType,
        mode,
      },
    );
  }

  getRecordingAssets(streamableId: number, streamableType: EDbModels): Observable<any> {
    const params = new HttpParams().set('streamable_id', streamableId).set('streamable_type', streamableType);
    return this.http.get<any>(
      this.baseApiService.getRoute(API_ROUTES.EMBEDDED_VIDEO_STREAMS.HMS_ROOMS.RECORDING_ASSETS),
      { params },
    );
  }
}
