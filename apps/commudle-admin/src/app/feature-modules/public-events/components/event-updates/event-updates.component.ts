import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  TemplateRef,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { ICommunity } from 'apps/shared-models/community.model';
import { IEvent } from 'apps/shared-models/event.model';
import { EventUpdatesService } from 'apps/commudle-admin/src/app/services/event-updates.service';
import { IEventUpdate } from 'apps/shared-models/event_update.model';
import * as moment from 'moment';
import { IPageInfo } from '@commudle/shared-models';
import { NbDialogService } from '@commudle/theme';
import { SeoService } from 'apps/shared-services/seo.service';
import { environment } from 'apps/commudle-admin/src/environments/environment';
@Component({
  selector: 'app-event-updates',
  templateUrl: './event-updates.component.html',
  styleUrls: ['./event-updates.component.scss'],
  standalone: false,
})
export class EventUpdatesComponent implements OnInit, OnChanges {
  @Input() community: ICommunity;
  @Input() event: IEvent;
  @Output() hasUpdates = new EventEmitter();

  eventUpdates: IEventUpdate[] = [];
  moment = moment;
  page_info: IPageInfo;
  limit = 5;
  private liveBlogSchemaRendered = false;

  @ViewChild('imageTemplate') imageTemplate: TemplateRef<any>;

  constructor(
    private eventUpdatesService: EventUpdatesService,
    private dialogService: NbDialogService,
    private seoService: SeoService,
  ) {}

  ngOnInit() {
    this.getEventUpdates();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.event?.firstChange) {
      if (this.page_info) this.page_info.end_cursor = '';
      this.eventUpdates = [];
      this.liveBlogSchemaRendered = false;
      this.getEventUpdates();
    }
  }

  getEventUpdates() {
    this.eventUpdatesService
      .pGetEventUpdates(this.event.id, this.limit, this.page_info?.end_cursor)
      .subscribe((data) => {
        this.eventUpdates = this.eventUpdates.concat(data.page.reduce((acc, value) => [...acc, value.data], []));
        this.page_info = data.page_info;
        if (this.eventUpdates.length > 0) {
          this.hasUpdates.emit(true);
          if (!this.liveBlogSchemaRendered) {
            this.liveBlogSchemaRendered = true;
            this.setSchema();
          }
        }
      });
  }

  openImage(image, eu) {
    this.dialogService.open(this.imageTemplate, {
      context: {
        image: image,
        eventUpdate: eu,
      },
    });
  }

  private setSchema() {
    this.seoService.setSchema({
      '@context': 'https://schema.org',
      '@type': 'LiveBlogPosting',
      '@id': `${environment.app_url}/communities/${this.community.slug}/events/${this.event.slug}#live-updates`,
      about: {
        '@type': 'Event',
        name: this.event.name,
        startDate: this.event.start_time,
      },

      coverageStartTime: this.event.start_time,
      coverageEndTime: this.event.end_time,

      url: `${environment.app_url}/communities/${this.community.slug}/events/${this.event.slug}`,

      liveBlogUpdate: this.eventUpdates.map((update) => ({
        '@type': 'BlogPosting',
        datePublished: update.created_at,
        articleBody: (update.details || '').replace(/<[^>]*>/g, ''),
        image: update.images?.length ? update.images[0]?.url || update.images[0]?.i128 : undefined,
        author: {
          '@type': 'Organization',
          name: this.community.name,
        },
      })),
    });
  }
}
