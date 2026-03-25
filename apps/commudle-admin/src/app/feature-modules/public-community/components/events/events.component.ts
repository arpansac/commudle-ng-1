import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';
import { EventsService } from 'apps/commudle-admin/src/app/services/events.service';
import { ICommunity } from 'apps/shared-models/community.model';
import { IEvent } from 'apps/shared-models/event.model';
import { SeoService } from 'apps/shared-services/seo.service';
import { faCalendarCheck, faCalendarDays, faMapPin } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'apps/commudle-admin/src/environments/environment';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  standalone: false,
})
export class EventsComponent implements OnInit {
  moment = moment;
  momentTimezone = momentTimezone;
  community: ICommunity;
  events: IEvent[] = [];
  isLoadingPastEvents = true;
  isLoadingUpcomingEvents = true;
  isLoading = true;

  eventForSchema = [];

  upcomingEvents = [];
  pastEvents = [];
  faMapPin = faMapPin;
  faCalendarDays = faCalendarDays;
  faCalendarCheck = faCalendarCheck;

  count = 9;
  page = 1;
  total = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private eventsService: EventsService,
    private seoService: SeoService,
    private router: Router,
  ) {}

  ngOnInit() {
    const params = this.activatedRoute.snapshot.queryParams;
    this.page = params.page ? Number(params.page) : 1;

    this.activatedRoute.parent.data.subscribe((data) => {
      this.community = data.community;
      this.getUpcomingEvents();
      this.getPastEvents();
      this.seoService.setTitle(`Events | ${this.community.name}`);
    });
  }

  getPastEvents() {
    this.isLoadingPastEvents = true;
    this.eventsService.pGetCommunityEvents('past', this.community.id, this.page, this.count).subscribe((data) => {
      this.pastEvents = data.values;
      this.total = data.total;
      this.page = data.page;
      this.count = data.count;
      this.isLoadingPastEvents = false;
      this.isLoading = false;
      this.checkSetSchema();
      if (this.page > 1) {
        this.router.navigate([], { queryParams: { page: this.page } });
      }
    });
  }

  getUpcomingEvents() {
    this.isLoadingUpcomingEvents = true;
    this.eventsService.pGetCommunityEvents('future', this.community.id).subscribe((data) => {
      this.upcomingEvents = data.values;
      this.isLoadingUpcomingEvents = false;
      this.checkSetSchema();
    });
  }

  checkSetSchema() {
    if (!this.isLoadingUpcomingEvents && !this.isLoadingPastEvents) {
      const allEvents = [...this.upcomingEvents, ...this.pastEvents];
      this.setSchema(allEvents);
    }
  }

  setSchema(events: IEvent[]) {
    if (events.length > 0) {
      this.eventForSchema = [];
      for (const event of events) {
        let location: object, eventStatus: string;
        if (event.event_locations && Object.keys(event.event_locations).length > 0 && event.event_type === 'offline') {
          location = {
            '@type': 'Place',
            name: event.event_locations[0].name,
            address: event.event_locations[0].address,
          };
          eventStatus = 'OfflineEventAttendanceMode';
        } else {
          location = {
            '@type': 'VirtualLocation',
            url: environment.app_url + '/communities/' + event.kommunity_slug + '/events/' + event.slug,
          };
          eventStatus = 'OnlineEventAttendanceMode';
        }
        this.eventForSchema.push({
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: event.name,
          image: event.header_image_path ? event.header_image_path : this.community.logo_image_path.url,
          description: event.description.replace(/<[^>]*>/g, '').substring(0, 200),
          startDate: event.start_time,
          endDate: event.end_time,
          eventStatus: 'https://schema.org/EventScheduled',
          eventAttendanceMode: 'https://schema.org/' + eventStatus,
          location: location,
          organizer: {
            '@type': 'Organization',
            name: this.community.name,
            url: environment.app_url + '/communities/' + this.community.slug,
          },
          performer: {
            '@type': 'PerformingGroup',
            name: this.community.name,
          },
          offers: {
            '@type': 'Offer',
            name: event.name,
            url: environment.app_url + '/communities/' + this.community.slug + '/events/' + event.slug,
          },
        });
      }

      this.seoService.setSchema(this.eventForSchema);
    }
  }
}
