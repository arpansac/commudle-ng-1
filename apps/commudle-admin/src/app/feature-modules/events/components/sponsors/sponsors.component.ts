import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NbDialogService, NbWindowService } from '@commudle/theme';
import { IEventSponsor } from 'apps/shared-models/event_sponsor.model';
import { ISponsor } from 'apps/shared-models/sponsor.model';
import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';
import { ActivatedRoute } from '@angular/router';
import { EventSponsorsService } from 'apps/commudle-admin/src/app/services/event-sponsors.service';
import { Subscription } from 'rxjs';
import { IEvent, ICommunity } from '@commudle/shared-models';
import { SeoService } from '@commudle/shared-services';

@Component({
  selector: 'app-sponsors',
  templateUrl: './sponsors.component.html',
  styleUrls: ['./sponsors.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SponsorsComponent implements OnInit, OnDestroy {
  @Input() event: IEvent;
  community: ICommunity;

  existingSponsors: ISponsor[] = [];
  sponsors: IEventSponsor[] = [];
  windowRef;

  sponsorForm;

  uploadedLogoImageFile: File;
  uploadedLogoImage;

  subscriptions: Subscription[] = [];

  @ViewChild('sponsorFormTemplate') sponsorFormTemplate: TemplateRef<any>;

  constructor(
    private windowService: NbWindowService,
    private fb: FormBuilder,
    private toastLogService: LibToastLogService,
    private eventSponsorsService: EventSponsorsService,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private dialogService: NbDialogService,
    private seoService: SeoService,
  ) {
    this.sponsorForm = this.fb.group({
      logo: ['', Validators.required],
      name: ['', Validators.required],
      link: [''],
    });
  }

  ngOnInit() {
    this.seoService.noIndex(true);
    this.subscriptions.push(
      this.activatedRoute.parent.data.subscribe((data) => {
        this.event = data.event;
        this.community = data.community;
        this.setMeta();
        this.getAllSponsors();
        this.getPastSponsors();
      }),
    );
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  getAllSponsors() {
    this.eventSponsorsService.index(this.event.slug).subscribe((data) => {
      this.sponsors = data.event_sponsors;
      this.changeDetectorRef.markForCheck();
    });
  }

  openForm() {
    this.sponsorForm.reset();
    this.uploadedLogoImageFile = null;
    this.windowRef = this.windowService.open(this.sponsorFormTemplate, {
      title: 'Add a Sponsor',
    });
  }

  getPastSponsors() {
    this.eventSponsorsService.getExistingSponsors(this.event.slug).subscribe((data) => {
      this.existingSponsors = data.sponsors;
      this.changeDetectorRef.markForCheck();
    });
  }

  addExistingSponsor(sponsorId) {
    this.eventSponsorsService.addExistingSponsor(this.event.slug, sponsorId).subscribe((data) => {
      this.sponsors.push(data);
      this.windowRef.close();
      this.toastLogService.successDialog(`${data.sponsor.name} added`, 3000);
      this.changeDetectorRef.markForCheck();
    });
  }

  createSponsor() {
    const formData: any = new FormData();

    const sponsorFormData = this.sponsorForm.value;
    Object.keys(sponsorFormData).forEach((key) =>
      !(sponsorFormData[key] == null) ? formData.append(`sponsor[${key}]`, sponsorFormData[key]) : '',
    );

    if (this.uploadedLogoImageFile) {
      formData.append('sponsor[logo]', this.uploadedLogoImageFile);
    }
    this.eventSponsorsService.create(this.event.slug, formData).subscribe((data) => {
      this.sponsors.push(data);
      this.windowRef.close();
      this.removeLogo();
      this.sponsorForm.reset();
      this.toastLogService.successDialog(`${data.sponsor.name} added`, 3000);
      this.changeDetectorRef.markForCheck();
    });
  }

  removeSponsor(eventSponsorId, index) {
    this.eventSponsorsService.destroy(eventSponsorId).subscribe((data) => {
      this.sponsors.splice(index, 1);
      this.changeDetectorRef.markForCheck();
    });
  }

  // form functionalities
  displaySelectedLogo(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 2425190) {
        this.toastLogService.warningDialog('Image should be less than 2 Mb', 3000);
        return;
      }
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

      if (!allowedTypes.includes(file.type)) {
        this.toastLogService.warningDialog('Please upload a valid image file (PNG, JPG, JPEG)');
        return;
      }
      this.uploadedLogoImageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.uploadedLogoImage = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo() {
    this.uploadedLogoImage = null;
    this.uploadedLogoImageFile = null;
    this.sponsorForm.get('logo').patchValue('');
  }

  openConfirmDeleteDialog(confirmDeleteDialogTemplate, sponsor, index) {
    this.dialogService.open(confirmDeleteDialogTemplate, {
      context: {
        sponsor_id: sponsor.id,
        index: index,
      },
    });
  }

  setMeta() {
    this.seoService.setTitle(`Sponsors | Dashboard | ${this.event.name} | ${this.community.name}`);
  }
}
