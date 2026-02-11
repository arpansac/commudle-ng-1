import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { LibAuthwatchService } from './lib-authwatch.service';

type ActionCableModule = typeof import('actioncable');


@Injectable({
  providedIn: 'root'
})
export class ActionCableConnectionSocket {

  private baseAcUrl;
  private actionCable: ActionCableModule | null = null;
  private acSocket: BehaviorSubject<any> = new BehaviorSubject(null);
  public acSocket$: Observable<any> = this.acSocket.asObservable();


  constructor(
    private authWatchService: LibAuthwatchService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  setBaseUrl(envBase: string): string {
    return this.baseAcUrl = envBase;
  }

  getBaseUrl(): string {
    return this.baseAcUrl;
  }

  getRoute(channelRoute: string): string {
    return `${this.baseAcUrl}/${channelRoute}`;
  }

  async connectToServer() {
    // ActionCable is browser-only (it references window/WebSocket).
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!this.actionCable) {
      this.actionCable = (await import('actioncable')) as unknown as ActionCableModule;
    }

    if (this.acSocket.value != null) {
      this.acSocket.value.disconnect();
      this.acSocket.next(null);
    }

    this.acSocket.next(
      this.actionCable.createConsumer(this.baseAcUrl + `?user_auth_token=${this.authWatchService.getAuthCookie()}`),
    );
  }

}
