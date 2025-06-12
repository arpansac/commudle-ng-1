import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { EventsService } from 'apps/commudle-admin/src/app/services/events.service';
import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { faFileLines } from '@fortawesome/free-regular-svg-icons';
import { IEvent, ICommunity } from '@commudle/shared-models';
import { SeoService } from '@commudle/shared-services';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss'],
})
export class EventDetailsComponent implements OnInit, OnDestroy {
  @Input() event: IEvent;
  @Input() community: ICommunity;

  subscriptions: Subscription[] = [];

  moment = moment;
  isStatsLoading = true;

  uploadedHeaderImageFile: File;
  uploadedHeaderImage;
  icons = {
    faArrowRight,
    faFileLines,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private eventsService: EventsService,
    private toastLogService: LibToastLogService,
    private seoService: SeoService,
  ) {}

  ngOnInit(): void {
    this.seoService.noIndex(true);
    this.getEventAndCommunityData();
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  getEventAndCommunityData() {
    this.subscriptions.push(
      this.activatedRoute.parent.data.subscribe((value) => {
        this.event = value.event;
        this.community = value.community;
        this.setMeta();
      }),
    );
  }

  deleteEventHeader() {
    this.eventsService.deleteHeaderImage(this.event.id).subscribe((data) => {
      this.uploadedHeaderImage = null;
      this.uploadedHeaderImageFile = null;
      this.event = data;
      this.toastLogService.successDialog('Deleted');
    });
  }

  displaySelectedHeaderImage(event: any) {
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
      this.uploadedHeaderImageFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.uploadedHeaderImage = reader.result);

      reader.readAsDataURL(file);
      this.updateEventHeader();
    }
  }

  updateEventHeader() {
    const formData: any = new FormData();
    formData.append('header_image', this.uploadedHeaderImageFile);
    this.eventsService.updateHeaderImage(this.event.id, formData).subscribe((data) => {
      this.event = data;
      this.toastLogService.successDialog('Updated!');
    });
  }

  setMeta() {
    this.seoService.setTitle(`Details | Dashboard | ${this.event.name} | ${this.community.name}`);
  }
}
