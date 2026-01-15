import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HackathonEntryPassesService, ToastrService } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
import { BarcodeFormat } from '@zxing/library';
import { EInvitationStatus, IHackathon, IHackathonEntryPass } from '@commudle/shared-models';
import { SeoService } from 'apps/shared-services/seo.service';
import { Subject, takeUntil } from 'rxjs';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';

@Component({
  selector: 'commudle-hackathon-entry-pass-scan',
  standalone: false,
  templateUrl: './hackathon-entry-pass-scan.component.html',
  styleUrls: ['./hackathon-entry-pass-scan.component.scss'],
})
export class HackathonEntryPassScanComponent implements OnInit, OnDestroy {
  hackathon: IHackathon;
  entryPass: IHackathonEntryPass;

  isScannerEnabled = true;
  isLoadingEntryPass = false;
  isWindowOpen = false;
  availableDevices: MediaDeviceInfo[];
  deviceCurrent: MediaDeviceInfo;
  deviceSelected: string;

  formatsEnabled: BarcodeFormat[] = [BarcodeFormat.QR_CODE];

  hasDevices: boolean;
  hasPermission: boolean;

  EInvitationStatus = EInvitationStatus;

  @ViewChild('entryPassDetailsDialogBox') entryPassDetailsDialogBox: TemplateRef<any>;
  @ViewChild('correctSound') correctSound: ElementRef<HTMLAudioElement>;
  @ViewChild('incorrectSound') incorrectSound: ElementRef<HTMLAudioElement>;

  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private seoService: SeoService,
    private toastrService: ToastrService,
    private nbDialogService: NbDialogService,
    private hackathonService: HackathonService,
    private hackathonEntryPassesService: HackathonEntryPassesService,
  ) {}

  ngOnInit(): void {
    this.getRouteData();
    this.seoService.noIndex(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.seoService.noIndex(false);
  }

  getRouteData(): void {
    this.activatedRoute.params.subscribe((params) => {
      const hackathonId = params['hackathon_id'];
      this.hackathonService.showHackathon(hackathonId).subscribe((data) => {
        this.hackathon = data;
        this.setMeta();
      });
    });
  }

  getEntryPass(entryCode: string): void {
    this.isLoadingEntryPass = true;
    this.entryPass = null;

    this.hackathonEntryPassesService.scanEntryPass(this.hackathon.id, entryCode).subscribe({
      next: (data: IHackathonEntryPass) => {
        this.entryPass = data;
        if (this.entryPass.attendance) {
          this.toastrService.warningDialog('Attendance already marked');
          this.incorrectSound.nativeElement.play();
        }
        this.openDialogBox();
        this.isLoadingEntryPass = false;
      },
      error: () => {
        this.incorrectSound.nativeElement.play();
        this.isLoadingEntryPass = false;
      },
    });
  }

  unmarkAttendance(): void {
    this.hackathonEntryPassesService
      .updateAttendance(this.hackathon.id, this.entryPass.entry_pass_code, false)
      .subscribe({
        next: () => {
          this.correctSound.nativeElement.play();
          this.toastrService.successDialog('Attendance unmarked');
        },
        error: () => {
          this.incorrectSound.nativeElement.play();
        },
      });
  }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    this.hasDevices = Boolean(devices && devices.length);
    if (devices?.length && !this.deviceSelected) {
      this.deviceSelected = devices[0].deviceId;
    }
  }

  onCodeResult(resultString: string): void {
    if (!this.isWindowOpen) {
      this.getEntryPass(resultString);
    }
  }

  onDeviceSelectChange(event): void {
    const selected = event.value;
    const selectedStr = typeof selected === 'string' ? selected : selected || '';
    if (this.deviceSelected === selectedStr) {
      return;
    }
    this.deviceSelected = selectedStr;
    const device = this.availableDevices.find((x) => x.deviceId === selectedStr);
    this.deviceCurrent = device || undefined;
  }

  onDeviceChange(device: MediaDeviceInfo): void {
    this.deviceSelected = device?.deviceId || '';
    this.deviceCurrent = device || undefined;
  }

  onHasPermission(has: boolean): void {
    this.hasPermission = has;
  }

  openDialogBox(): void {
    this.isWindowOpen = true;
    this.nbDialogService.open(this.entryPassDetailsDialogBox, {
      closeOnEsc: false,
      closeOnBackdropClick: false,
    });
  }

  handleOk(): void {
    this.isWindowOpen = false;
    this.hackathonEntryPassesService
      .updateAttendance(this.hackathon.id, this.entryPass.entry_pass_code, true)
      .subscribe({
        next: () => {
          this.correctSound.nativeElement.play();
          this.toastrService.successDialog('Attendance Marked');
        },
        error: () => {
          this.incorrectSound.nativeElement.play();
        },
      });
  }

  onSubmit(value: string): void {
    if (value?.length) {
      this.getEntryPass(value);
    }
  }

  setMeta(): void {
    this.seoService.setTags(
      `Entry Pass Scanner | ${this.hackathon?.name}`,
      `Scan entry passes for ${this.hackathon?.name} hackathon`,
    );
  }
}
