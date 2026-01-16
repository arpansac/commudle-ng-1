import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as actionCable from 'actioncable';
import { APPLICATION_CABLE_CHANNELS } from 'apps/shared-services/application-cable-channels.constants';
import { ActionCableConnectionSocket } from 'apps/shared-services/action-cable-connection.socket';
import { LibAuthwatchService } from 'apps/shared-services/lib-authwatch.service';

@Injectable({
  providedIn: 'root',
})
export class RoundMentorSlotBookingChannel {
  ACTIONS = {
    SET_PERMISSIONS: 'set_permissions',
    BOOK: 'book',
    CANCEL: 'cancel',
    UPDATE: 'update',
    ERROR: 'error',
    BLOCKED: 'blocked',
  };

  actionCable = actionCable;
  private cableConnection;
  private subscription;
  private actionCableSubscription;

  private channelData: BehaviorSubject<any> = new BehaviorSubject(null);
  public channelData$ = this.channelData.asObservable();

  constructor(
    private actionCableConnection: ActionCableConnectionSocket,
    private authWatchService: LibAuthwatchService,
  ) {
    this.actionCableSubscription = this.actionCableConnection.acSocket$.subscribe((connection) => {
      this.cableConnection = connection;
    });
  }

  subscribe(roundId: number) {
    if (this.cableConnection) {
      this.subscription = this.cableConnection.subscriptions.create(
        {
          channel: APPLICATION_CABLE_CHANNELS.ROUND_MENTOR_SLOT_BOOKING_CHANNEL,
          round_id: roundId,
          app_token: this.authWatchService.getAppToken(),
        },
        {
          received: (data) => {
            this.channelData.next(data);
          },
        },
      );
    }

    return this.subscription;
  }

  sendData(action, data) {
    this.subscription.send({
      perform: action,
      data,
    });
  }

  unsubscribe() {
    if (this.subscription) {
      this.channelData.next(null);
      this.subscription.unsubscribe();
      this.actionCableSubscription.unsubscribe();
    }
  }
}
