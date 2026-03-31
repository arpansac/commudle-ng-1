import { HMSLogLevel, selectIsConnectedToRoom } from '@100mslive/hms-video-store';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { LayoutService } from '@commudle/shared-services';
import { hmsActions, hmsStore } from 'apps/shared-modules/hms-video/stores/hms.store';
import { IsBrowserService } from 'apps/shared-services/is-browser.service';
import { WhatsNewService } from 'apps/shared-services/whats-new.service';

@Component({
  selector: 'app-hms-beam',
  templateUrl: './hms-beam.component.html',
  styleUrls: ['./hms-beam.component.scss'],
  providers: [IsBrowserService],
  standalone: false,
})
export class HmsBeamComponent implements OnInit, OnDestroy {
  authToken: string;

  isBrowser: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private isBrowserService: IsBrowserService,
    private whatsNewService: WhatsNewService,
    private layoutService: LayoutService,
  ) {
    this.isBrowser = this.isBrowserService.isBrowser();
  }

  ngOnInit(): void {
    this.whatsNewService.hideWhatsNewPopup();
    this.layoutService.changeFullHeightContent(false);
    hmsActions.setLogLevel(HMSLogLevel.VERBOSE);

    if (!this.isBrowser) {
      return;
    }

    this.activatedRoute.queryParams.subscribe((value: Params) => {
      this.authToken = value.authToken;

      this.joinRoom();
    });
  }

  ngOnDestroy(): void {
    this.layoutService.changeFullHeightContent(true);
  }

  joinRoom(): void {
    hmsActions.join({
      authToken: this.authToken,
      userName: 'commudle-beam',
    });

    hmsStore.subscribe((value: boolean) => {
      if (value) {
        hmsActions.unblockAudio();
      }
    }, selectIsConnectedToRoom);
  }
}
