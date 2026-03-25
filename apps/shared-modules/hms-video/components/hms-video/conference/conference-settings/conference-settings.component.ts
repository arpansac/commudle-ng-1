import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { NbDialogRef, NbDialogService, NbTrigger } from '@commudle/theme';
import { EHmsRoomMode } from '@commudle/shared-models';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faLaptop } from '@fortawesome/free-solid-svg-icons';
import { IEmbeddedVideoStream } from 'apps/shared-models/embedded_video_stream.model';
import { IEvent } from '@commudle/shared-models';
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
  event: IEvent;
  activeTab: 'audio-video' | 'session-type' = 'audio-video';
  EHmsRoomMode = EHmsRoomMode;
  showModeConfirmation = false;
  pendingMode: EHmsRoomMode = null;
  faYoutube = faYoutube;
  faLaptop = faLaptop;
  currentMode: EHmsRoomMode;

  @Output() streamingAction = new EventEmitter<string>();
  @Output() modeChanged = new EventEmitter<EHmsRoomMode>();
  @Output() refreshEmbeddedVideoStream = new EventEmitter<IEmbeddedVideoStream>();

  loadingAction: string = null;

  audioInputDevices: MediaDeviceInfo[] = [];
  videoDevices: MediaDeviceInfo[] = [];

  selectedAudioInputDeviceId: string;
  selectedVideoDeviceId: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;

  NbTrigger = NbTrigger;

  @ViewChild('previewVideo', { static: false }) previewVideo: ElementRef<HTMLVideoElement>;
  @ViewChild('confirmDialog') confirmDialog: TemplateRef<any>;
  @ViewChild('hlsOptionsDialog') hlsOptionsDialog: TemplateRef<any>;

  subscriptions: Subscription[] = [];

  micLevel = 0;
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private micStream: MediaStream;
  private micAnimationId: number;

  constructor(
    protected dialogRef: NbDialogRef<ConferenceSettingsComponent>,
    private nbDialogService: NbDialogService,
    private localMediaService: LocalMediaService,
    private libToastLogService: LibToastLogService,
  ) {}

  ngOnInit(): void {
    this.getMediaPermissions();
  }

  ngOnDestroy(): void {
    this.stopStream();
    this.stopMicMeter();
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

          this.startMicMeter();
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
    this.startMicMeter();
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
    if (this.isVideoEnabled && this.previewVideo?.nativeElement) {
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
    const modeName = mode === EHmsRoomMode.INTERACTIVE ? 'Interactive' : 'Large Scale Webinar';
    this.confirmTitle = 'Switch Session Type';
    this.confirmMessage = `Are you sure you want to switch to ${modeName} mode?`;
    this.pendingMode = mode;
    const ref = this.nbDialogService.open(this.confirmDialog, { closeOnBackdropClick: false });
    ref.onClose.subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.currentMode = this.pendingMode;
        this.modeChanged.emit(this.currentMode);
      }
      this.pendingMode = null;
    });
  }

  onToggleYTStreaming(): void {
    if (this.isStreaming) {
      this.openConfirmDialog(
        'Stop YouTube Streaming',
        'Are you sure you want to stop YT streaming? Once stopped, YouTube might stop the YouTube live for all viewers.',
        'toggleYTStreaming',
      );
    } else {
      this.executeAction('toggleYTStreaming');
    }
  }

  onToggleIsLive(): void {
    if (this.isLive) {
      this.openConfirmDialog(
        'Stop Streaming',
        'Are you sure you want to stop streaming? This will stop the stream to all viewers, but can be started again.',
        'toggleIsLive',
      );
    } else {
      this.executeAction('toggleIsLive');
    }
  }

  onToggleHls(): void {
    if (this.isHlsRunning) {
      this.openConfirmDialog(
        'Stop HLS Streaming',
        'Are you sure you want to stop streaming? This will stop the stream to all viewers, but can be started again.',
        'toggleHls',
      );
    } else {
      const ref = this.nbDialogService.open(this.hlsOptionsDialog, { closeOnBackdropClick: false });
      ref.onClose.subscribe((action: string) => {
        if (action) {
          this.executeAction(action);
        }
      });
    }
  }

  onToggleRecording(): void {
    if (this.isRecording) {
      this.openConfirmDialog('Stop Recording', 'Are you sure you want to stop recording?', 'stopRecordingViaHls');
    } else {
      this.openConfirmDialog(
        'Start Recording',
        'This will restart HLS streaming with recording enabled. Continue?',
        'startRecordingViaHls',
      );
    }
  }

  private openConfirmDialog(title: string, message: string, actionKey: string): void {
    this.confirmTitle = title;
    this.confirmMessage = message;
    this.pendingActionKey = actionKey;
    const ref = this.nbDialogService.open(this.confirmDialog, { closeOnBackdropClick: false });
    ref.onClose.subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.executeAction(this.pendingActionKey);
      }
      this.pendingActionKey = null;
    });
  }

  confirmTitle = '';
  confirmMessage = '';
  private pendingActionKey: string = null;

  private executeAction(actionKey: string): void {
    this.loadingAction = actionKey;
    this.streamingAction.emit(actionKey);
  }

  onEmbeddedVideoStreamUpdated(evs: IEmbeddedVideoStream): void {
    this.embeddedVideoStream = evs;
    this.refreshEmbeddedVideoStream.emit(evs);
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

  private startMicMeter(): void {
    this.stopMicMeter();
    const deviceId = this.selectedAudioInputDeviceId || 'default';
    navigator.mediaDevices.getUserMedia({ audio: { deviceId } }).then((stream) => {
      this.micStream = stream;
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);
      this.updateMicLevel();
    });
  }

  private updateMicLevel(): void {
    if (!this.analyser) return;
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    const avg = data.reduce((sum, val) => sum + val, 0) / data.length;
    this.micLevel = Math.min(100, Math.round((avg / 128) * 100));
    this.micAnimationId = requestAnimationFrame(() => this.updateMicLevel());
  }

  private stopMicMeter(): void {
    if (this.micAnimationId) {
      cancelAnimationFrame(this.micAnimationId);
      this.micAnimationId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this.micLevel = 0;
  }
}
