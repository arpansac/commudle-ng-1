import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NbDialogRef, NbTrigger } from '@commudle/theme';
import { EHmsRoomMode } from '@commudle/shared-models';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faLaptop } from '@fortawesome/free-solid-svg-icons';
import { IEmbeddedVideoStream } from 'apps/shared-models/embedded_video_stream.model';
import { LocalMediaService } from 'apps/shared-modules/hms-video/services/local-media.service';
import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';
import { combineLatest, Subscription } from 'rxjs';

@Component({
  selector: 'app-conference-settings',
  templateUrl: './conference-settings.component.html',
  styleUrls: ['./conference-settings.component.scss'],
  standalone: false,
})
export class ConferenceSettingsComponent implements OnInit, OnDestroy {
  invitation: boolean;
  joinStage: boolean;
  showSessionTypeSettings = false;
  isStreamingActive = false;
  isStreaming = false;
  isLive = false;
  isHlsRunning = false;
  isRecording = false;
  embeddedVideoStream: IEmbeddedVideoStream;
  activeTab: 'audio-video' | 'session-type' = 'audio-video';
  EHmsRoomMode = EHmsRoomMode;
  showModeConfirmation = false;
  pendingMode: EHmsRoomMode = null;
  faYoutube = faYoutube;
  faLaptop = faLaptop;
  currentMode: EHmsRoomMode;

  @Output() streamingAction = new EventEmitter<string>();
  @Output() modeChanged = new EventEmitter<EHmsRoomMode>();

  loadingAction: string = null;

  audioInputDevices: MediaDeviceInfo[] = [];
  videoDevices: MediaDeviceInfo[] = [];

  selectedAudioInputDeviceId: string;
  selectedVideoDeviceId: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;

  NbTrigger = NbTrigger;

  @ViewChild('previewVideo', { static: false }) previewVideo: ElementRef<HTMLVideoElement>;

  subscriptions: Subscription[] = [];

  constructor(
    protected dialogRef: NbDialogRef<ConferenceSettingsComponent>,
    private localMediaService: LocalMediaService,
    private libToastLogService: LibToastLogService,
  ) {}

  ngOnInit(): void {
    this.getMediaPermissions();
  }

  ngOnDestroy(): void {
    this.stopStream();
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  getMediaPermissions(): void {
    const microphone = 'microphone' as PermissionName;
    const camera = 'camera' as PermissionName;

    this.subscriptions.push(
      combineLatest(
        this.localMediaService.getMediaPermissions(camera),
        this.localMediaService.getMediaPermissions(microphone),
      ).subscribe(([cameraPermissions, microphonePermissions]) => {
        if (cameraPermissions === 'granted' && microphonePermissions === 'granted') {
          this.getMediaDevices();
        } else if (cameraPermissions === 'prompt' || microphonePermissions === 'prompt') {
          navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then((stream: MediaStream) => {
            stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
            this.getMediaPermissions();
          });
        } else if (cameraPermissions === 'denied' || microphonePermissions === 'denied') {
          this.libToastLogService.warningDialog('Browser denied permission');
        }
      }),
    );
  }

  getMediaDevices(): void {
    this.subscriptions.push(
      combineLatest(this.localMediaService.getAudioInputDevices(), this.localMediaService.getVideoDevices()).subscribe(
        ([audioInputDevices, videoDevices]) => {
          this.audioInputDevices = audioInputDevices;
          this.videoDevices = videoDevices;

          this.selectedAudioInputDeviceId = this.localMediaService.getAudioInputDeviceId();
          this.selectedVideoDeviceId = this.localMediaService.getVideoDeviceId();
          this.isAudioEnabled = this.localMediaService.getIsAudioEnabled();
          this.isVideoEnabled = this.localMediaService.getIsVideoEnabled();

          if (this.isVideoEnabled) {
            this.renderVideo();
          }

          if (this.localMediaService.getAudioInputDeviceId() === 'default') {
            this.selectAudioInputDevice(audioInputDevices[0].deviceId);
          }
          if (this.localMediaService.getVideoDeviceId() === 'default') {
            this.selectVideoDevice(videoDevices[0].deviceId);
          }
        },
      ),
    );
  }

  renderVideo(): void {
    this.localMediaService.getVideoStream(this.selectedVideoDeviceId).subscribe((stream: MediaStream) => {
      this.stopStream();
      this.previewVideo.nativeElement.srcObject = stream;
    });
  }

  selectAudioInputDevice(deviceId: string): void {
    this.selectedAudioInputDeviceId = deviceId;
  }

  selectVideoDevice(deviceId: string): void {
    this.stopStream();
    this.selectedVideoDeviceId = deviceId;
    if (this.isVideoEnabled) {
      this.renderVideo();
    }
  }

  toggleAudio(): void {
    this.isAudioEnabled = !this.isAudioEnabled;
  }

  toggleVideo(): void {
    this.stopStream();
    this.isVideoEnabled = !this.isVideoEnabled;
    if (this.isVideoEnabled) {
      this.renderVideo();
    }
  }

  stopStream(): void {
    if (this.isVideoEnabled) {
      const stream: MediaStream | MediaSource | Blob = this.previewVideo.nativeElement.srcObject;
      if (stream) {
        if ('getTracks' in stream) {
          const tracks: MediaStreamTrack[] = stream.getTracks();
          tracks.forEach((track: MediaStreamTrack) => track.stop());
        }
        this.previewVideo.nativeElement.srcObject = null;
      }
    }
  }

  close(value: boolean): void {
    this.localMediaService.setAudioInputDeviceId(this.selectedAudioInputDeviceId);
    this.localMediaService.setVideoDeviceId(this.selectedVideoDeviceId);
    this.localMediaService.setIsAudioEnabled(this.isAudioEnabled);
    this.localMediaService.setIsVideoEnabled(this.isVideoEnabled);

    this.dialogRef.close(value);
  }

  selectMode(mode: EHmsRoomMode): void {
    if (this.isStreamingActive || mode === this.currentMode) {
      return;
    }
    this.pendingMode = mode;
    this.showModeConfirmation = true;
  }

  confirmModeChange(): void {
    this.currentMode = this.pendingMode;
    this.showModeConfirmation = false;
    this.modeChanged.emit(this.currentMode);
  }

  cancelModeChange(): void {
    this.pendingMode = null;
    this.showModeConfirmation = false;
  }

  onToggleYTStreaming(): void {
    this.loadingAction = 'toggleYTStreaming';
    this.streamingAction.emit('toggleYTStreaming');
  }

  onToggleIsLive(): void {
    this.loadingAction = 'toggleIsLive';
    this.streamingAction.emit('toggleIsLive');
  }

  onToggleHls(): void {
    this.loadingAction = 'toggleHls';
    this.streamingAction.emit('toggleHls');
  }

  onToggleRecording(): void {
    this.loadingAction = 'toggleRecording';
    this.streamingAction.emit('toggleRecording');
  }

  updateStreamingState(state: {
    isLive?: boolean;
    isStreaming?: boolean;
    isHlsRunning?: boolean;
    isRecording?: boolean;
  }): void {
    if (state.isLive !== undefined) this.isLive = state.isLive;
    if (state.isStreaming !== undefined) this.isStreaming = state.isStreaming;
    if (state.isHlsRunning !== undefined) this.isHlsRunning = state.isHlsRunning;
    if (state.isRecording !== undefined) this.isRecording = state.isRecording;
    this.isStreamingActive = this.isLive || this.isStreaming || this.isHlsRunning || this.isRecording;
    this.loadingAction = null;
  }
}
