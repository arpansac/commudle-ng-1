import { CommonModule } from '@angular/common';
import { AfterContentInit, Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { AuthService, YoutubeLoginProvider } from '@commudle/auth';
import { ICommunityAuthToken, IEmbeddedVideoStream, IEvent } from '@commudle/shared-models';
import { ToastrService } from '@commudle/shared-services';
import {
  NbAlertModule,
  NbButtonModule,
  NbCardModule,
  NbDialogModule,
  NbDialogService,
  NbIconModule,
  NbSpinnerModule,
} from '@commudle/theme';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommunityAuthTokensService } from 'apps/commudle-admin/src/app/services/community-auth-tokens.service';
import { EmbeddedVideoStreamsService } from 'apps/commudle-admin/src/app/services/embedded-video-streams.service';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import { Subscription } from 'rxjs';

@Component({
  selector: 'commudle-event-streaming',
  templateUrl: './event-streaming.component.html',
  styleUrls: ['./event-streaming.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    NbButtonModule,
    NbCardModule,
    NbIconModule,
    NbAlertModule,
    NbSpinnerModule,
    NbDialogModule,
  ],
})
export class EventStreamingComponent implements AfterContentInit {
  @Input() embeddedVideoStream: IEmbeddedVideoStream;
  @Input() event: IEvent;

  @Output() refreshEmbeddedVideoStream: EventEmitter<IEmbeddedVideoStream> = new EventEmitter();

  communityAuthToken: ICommunityAuthToken;
  loaders = {
    createStream: false,
    deleteStream: false,
  };

  faYoutube = faYoutube;

  subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private communityAuthTokensService: CommunityAuthTokensService,
    private embeddedVideoStreamService: EmbeddedVideoStreamsService,
    private toastrService: ToastrService,
    private nbDialogService: NbDialogService,
  ) {
    authService.initialize_one(YoutubeLoginProvider.PROVIDER_ID);
  }

  ngAfterContentInit(): void {
    if (this.embeddedVideoStream.id) this.getToken();
  }

  getToken() {
    this.subscriptions.push(
      this.communityAuthTokensService.getToken(this.embeddedVideoStream.id, 'youtube').subscribe({
        next: (res) => (this.communityAuthToken = res),
        error: () => (this.communityAuthToken = null),
      }),
    );
  }

  createToken(authorization_code: string) {
    this.subscriptions.push(
      this.communityAuthTokensService
        .createToken({ parent_id: this.embeddedVideoStream.id, token_type: 'youtube', authorization_code })
        .subscribe((res) => {
          if (res) {
            this.toastrService.successDialog('Connected to Youtube');
            this.getToken();
            this.refreshEmbeddedVideoStream.emit(this.embeddedVideoStream);
          }
        }),
    );
  }

  loginToYoutube() {
    this.authService.getAccessToken(YoutubeLoginProvider.PROVIDER_ID).then((authorization_code) => {
      if (authorization_code) this.createToken(authorization_code);
    });
  }

  logoutFromYoutube() {
    this.subscriptions.push(
      this.communityAuthTokensService.deleteToken(this.embeddedVideoStream.id, 'youtube').subscribe((res) => {
        if (res) {
          this.toastrService.successDialog('Disconnected from Youtube');
          this.getToken();
          this.refreshEmbeddedVideoStream.emit(this.embeddedVideoStream);
        }
      }),
    );
  }

  createStream() {
    this.loaders.createStream = true;
    this.subscriptions.push(
      this.embeddedVideoStreamService.createLivestream(this.event.id, 'Event').subscribe({
        next: (res) => {
          if (res) {
            this.embeddedVideoStream = res;
            this.toastrService.successDialog('Stream created');
            this.refreshEmbeddedVideoStream.emit(this.embeddedVideoStream);
            this.loaders.createStream = false;
          }
        },
        error: () => (this.loaders.createStream = false),
      }),
    );
  }

  deleteStream() {
    this.loaders.deleteStream = true;
    this.subscriptions.push(
      this.embeddedVideoStreamService.deleteLivestream(this.event.id, 'Event').subscribe((res) => {
        if (res) {
          this.embeddedVideoStream = { ...this.embeddedVideoStream, youtube_broadcast: null, rtmp_url: null };
          this.toastrService.successDialog('Stream deleted');
          this.refreshEmbeddedVideoStream.emit(this.embeddedVideoStream);
          this.loaders.deleteStream = false;
        }
      }),
    );
  }

  openDialog(templateRef: TemplateRef<any>) {
    this.nbDialogService.open(templateRef);
  }
}
