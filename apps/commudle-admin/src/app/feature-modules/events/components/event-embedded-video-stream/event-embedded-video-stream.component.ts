import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { EHmsRoomMode, IEmbeddedVideoStream, IEvent, IUser, ICommunity } from '@commudle/shared-models';
import { AuthService, HmsRoomService, ToastrService } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
import { faDesktop, faExternalLinkAlt, faCode } from '@fortawesome/free-solid-svg-icons';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import { EmbeddedVideoStreamsService } from 'apps/commudle-admin/src/app/services/embedded-video-streams.service';
import { EEmbeddedVideoStreamSources } from 'apps/shared-models/enums/embedded_video_stream_sources.enum';
import { Subject, Subscription, takeUntil } from 'rxjs';

@Component({
  selector: 'commudle-event-embedded-video-stream',
  templateUrl: './event-embedded-video-stream.component.html',
  styleUrls: ['./event-embedded-video-stream.component.scss'],
  standalone: false,
})
export class EventEmbeddedVideoStreamComponent implements OnInit, OnDestroy {
  @Input() event: IEvent;
  @Input() community: ICommunity;
  @Input() embeddedVideoStreamFromTrackSlot = false;
  @Input() embeddedFormData;
  @Input() eventLocationTrackId: number;
  @Output() embeddedVideoStream = new EventEmitter<IEmbeddedVideoStream>();

  EEmbeddedVideoStreamSources = EEmbeddedVideoStreamSources;
  EHmsRoomMode = EHmsRoomMode;
  evs = <IEmbeddedVideoStream>{};
  currentUser: IUser;
  selectedMode: EHmsRoomMode = EHmsRoomMode.INTERACTIVE;
  savingInProgress = false;
  confirmTitle = '';
  confirmMessage = '';

  @ViewChild('confirmDialog') confirmDialog: TemplateRef<any>;

  sourceOptions = [
    {
      value: EEmbeddedVideoStreamSources.COMMUDLE,
      label: 'Commudle Stage',
      description: 'Up to 20 on stage, 500 viewers',
      icon: faDesktop,
      disabled: false,
    },
    {
      value: EEmbeddedVideoStreamSources.YOUTUBE,
      label: 'YouTube Live',
      description: 'Embed a YouTube live URL',
      icon: faYoutube,
      disabled: false,
    },
    {
      value: EEmbeddedVideoStreamSources.EXTERNAL_LINK,
      label: 'External Link',
      description: 'Google Meet, Teams, etc.',
      icon: faExternalLinkAlt,
      disabled: false,
    },
    {
      value: EEmbeddedVideoStreamSources.OTHER,
      label: 'Iframe Embed',
      description: 'Paste any iframe code',
      icon: faCode,
      disabled: false,
    },
  ];

  embeddedVideoStreamForm;
  subscription: Subscription;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private embeddedVideoStreamsService: EmbeddedVideoStreamsService,
    private hmsRoomService: HmsRoomService,
    private toastLogService: ToastrService,
    private authService: AuthService,
    private nbDialogService: NbDialogService,
  ) {
    this.embeddedVideoStreamForm = this.fb.group({
      streamable_type: ['', Validators.required],
      streamable_id: [0, Validators.required],
      source: ['', Validators.required],
      embed_code: ['', Validators.required],
      zoom_host_email: ['', Validators.email],
      zoom_password: [''],
      rtmp_url: ['', [this.validateRtmpUrl.bind(this)]],
    });
  }

  ngOnInit() {
    if (!this.embeddedVideoStreamFromTrackSlot) {
      this.embeddedVideoStreamForm.patchValue({ streamable_type: 'Event', streamable_id: this.event.id });
    } else if (this.embeddedFormData) {
      this.embeddedVideoStreamForm.patchValue(this.embeddedFormData);
      this.updateValidators();
    } else {
      this.embeddedVideoStreamForm.patchValue({
        streamable_type: 'EventLocationTrack',
        streamable_id: this.eventLocationTrackId,
      });
    }

    if (!this.embeddedVideoStreamFromTrackSlot) {
      this.getEmbeddedVideoStream();
    }

    this.subscription = this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((data: IUser) => {
      this.currentUser = data;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectSource(source: string): void {
    const current = this.embeddedVideoStreamForm.get('source').value;
    if (current && current !== source) {
      this.confirmTitle = 'Switch Video Source';
      this.confirmMessage =
        'Are you sure you want to switch the video source? This will reset the current configuration.';
      const ref = this.nbDialogService.open(this.confirmDialog, { closeOnBackdropClick: false });
      ref.onClose.subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.embeddedVideoStreamForm.patchValue({
            source,
            embed_code: '',
            zoom_host_email: '',
            zoom_password: '',
            rtmp_url: '',
          });
          this.updateValidators();
          this.createOrUpdate();
        }
      });
    } else {
      this.embeddedVideoStreamForm.patchValue({ source });
      this.updateValidators();
    }
  }

  selectMode(mode: EHmsRoomMode): void {
    if (this.selectedMode === mode) return;
    this.confirmTitle = 'Switch Session Mode';
    const modeName = mode === EHmsRoomMode.INTERACTIVE ? 'Interactive' : 'Large Scale Webinar';
    this.confirmMessage = `Are you sure you want to switch to ${modeName} mode?`;
    const ref = this.nbDialogService.open(this.confirmDialog, { closeOnBackdropClick: false });
    ref.onClose.subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.selectedMode = mode;
      }
    });
  }

  validateRtmpUrl(control) {
    const url: string = control.value;
    return !url || url.startsWith('rtmp://') ? null : { invalidUrl: true };
  }

  getEmbeddedVideoStream() {
    this.embeddedVideoStreamsService.get(this.event.id).subscribe((data) => {
      if (data) {
        this.evs = data;
        this.embeddedVideoStreamForm.patchValue(data);
        if (data.mode) {
          this.selectedMode = data.mode;
        }
        this.updateValidators();
      }
    });
  }

  createOrUpdate() {
    this.savingInProgress = true;
    if (this.embeddedVideoStreamFromTrackSlot) {
      this.embeddedVideoStream.emit(this.embeddedVideoStreamForm.value);
      this.savingInProgress = false;
      return;
    }

    this.embeddedVideoStreamsService.createOrUpdate(this.embeddedVideoStreamForm.value).subscribe({
      next: (data) => {
        delete this.evs;
        setTimeout(() => {
          this.evs = data;
        }, 100);
        this.embeddedVideoStreamForm.patchValue(data);
        this.updateValidators();

        if (
          this.embeddedVideoStreamForm.get('source').value === EEmbeddedVideoStreamSources.COMMUDLE &&
          data.streamable_id
        ) {
          this.hmsRoomService.updateMode(data.streamable_id, data.streamable_type, this.selectedMode).subscribe({
            next: () => {
              this.toastLogService.successDialog('Saved!');
              this.savingInProgress = false;
            },
            error: () => {
              this.toastLogService.successDialog('Saved! (mode update pending)');
              this.savingInProgress = false;
            },
          });
        } else {
          this.toastLogService.successDialog('Saved!');
          this.savingInProgress = false;
        }
      },
      error: () => {
        this.toastLogService.warningDialog('Failed to save');
        this.savingInProgress = false;
      },
    });
  }

  updateValidators() {
    this.embeddedVideoStreamForm.get('zoom_host_email').clearValidators();
    this.embeddedVideoStreamForm.get('zoom_password').clearValidators();
    this.embeddedVideoStreamForm.get('embed_code').setValidators([Validators.required]);

    switch (this.embeddedVideoStreamForm.get('source').value) {
      case EEmbeddedVideoStreamSources.ZOOM:
        this.embeddedVideoStreamForm.get('zoom_host_email').setValidators([Validators.required, Validators.email]);
        this.embeddedVideoStreamForm.get('zoom_password').setValidators(Validators.required);
        break;
      case EEmbeddedVideoStreamSources.COMMUDLE:
        this.embeddedVideoStreamForm.get('embed_code').clearValidators();
        break;
    }

    this.embeddedVideoStreamForm.get('zoom_host_email').updateValueAndValidity();
    this.embeddedVideoStreamForm.get('zoom_password').updateValueAndValidity();
    this.embeddedVideoStreamForm.get('embed_code').updateValueAndValidity();
  }
}
