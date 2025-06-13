import { Component, OnInit, Input } from '@angular/core';
import { IEvent, IUser } from '@commudle/shared-models';
import * as moment from 'moment';
import { EventsService } from 'apps/commudle-admin/src/app/services/events.service';
import {
  faArrowUpRightFromSquare,
  faCalendarDays,
  faCalendarPlus,
  faLocationDot,
  faShareNodes,
} from '@fortawesome/free-solid-svg-icons';
import { faApple, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import { ShareService } from '@commudle/shared-services';
import { environment } from '@commudle/shared-environments';
import { NbDialogService } from '@commudle/theme';

@Component({
  selector: 'commudle-event-registered-card',
  templateUrl: './event-registered-card.component.html',
  styleUrls: ['./event-registered-card.component.scss'],
})
export class EventRegisteredCardComponent implements OnInit {
  @Input() event: IEvent;
  moment = moment;
  interestedUsers: IUser[];
  interestedUsersCount: number;
  eventUrl: string;
  showCalendarOptions = false;

  readonly icons = {
    faCalendarDays,
    faLocationDot,
    faCalendarPlus,
    faShareNodes,
    faArrowUpRightFromSquare,
    faCircleCheck,
    faGoogle,
    faApple,
  };

  constructor(
    private eventService: EventsService,
    private shareService: ShareService,
    private dialogService: NbDialogService,
  ) {}

  ngOnInit(): void {
    this.fetchInterestedMembers();
  }

  fetchInterestedMembers() {
    this.eventService.pGetEventsInterestedMembers(this.event.id).subscribe((res) => {
      this.interestedUsers = res.users;
      this.interestedUsersCount = res.total_count;
    });
  }

  shareEvent() {
    const eventUrl = `${environment.app_url}/communities/${this.event.kommunity.id}/events/${this.event.slug}`;
    const shareText = `Check out this event: ${this.event.name}`;
    this.shareService.shareContent(eventUrl, this.event.name, shareText, eventUrl);
  }

  addToCalendar() {
    this.showCalendarOptions = !this.showCalendarOptions;
  }

  addToGoogleCalendar() {
    const startDate = moment(this.event.start_date).format('YYYYMMDDTHHmmss');
    const endDate = moment(moment(this.event.start_date).add(1, 'hours')).format('YYYYMMDDTHHmmss');
    const eventName = encodeURIComponent(this.event.name);
    const location = this.event.event_locations?.[0]?.name
      ? encodeURIComponent(this.event.event_locations[0].name)
      : '';
    const details = encodeURIComponent(this.event.description || `Event by ${this.event.kommunity.name}`);

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventName}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
    window.open(url, '_blank');
  }

  addToAppleCalendar() {
    const startDate = moment(this.event.start_date).format('YYYY-MM-DDTHH:mm:ss');
    const endDate = moment(moment(this.event.start_date).add(1, 'hours')).format('YYYY-MM-DDTHH:mm:ss');
    const eventName = this.event.name;
    const location = this.event.event_locations?.[0]?.name || '';
    const details = this.event.description || `Event by ${this.event.kommunity.name}`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${startDate.replace(/[-:]/g, '')}`,
      `DTEND:${endDate.replace(/[-:]/g, '')}`,
      `SUMMARY:${eventName}`,
      `DESCRIPTION:${details}`,
      `LOCATION:${location}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${eventName}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  addToOutlookCalendar() {
    const startDate = moment(this.event.start_date).format('YYYY-MM-DDTHH:mm:ss');
    const endDate = moment(moment(this.event.start_date).add(1, 'hours')).format('YYYY-MM-DDTHH:mm:ss');
    const eventName = encodeURIComponent(this.event.name);
    const location = this.event.event_locations?.[0]?.name
      ? encodeURIComponent(this.event.event_locations[0].name)
      : '';
    const details = encodeURIComponent(this.event.description || `Event by ${this.event.kommunity.name}`);

    const url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${eventName}&startdt=${startDate}&enddt=${endDate}&body=${details}&location=${location}`;
    window.open(url, '_blank');
  }

  addToYahooCalendar() {
    const startDate = moment(this.event.start_date).format('YYYYMMDDTHHmmss');
    const endDate = moment(moment(this.event.start_date).add(1, 'hours')).format('YYYYMMDDTHHmmss');
    const eventName = encodeURIComponent(this.event.name);
    const location = this.event.event_locations?.[0]?.name
      ? encodeURIComponent(this.event.event_locations[0].name)
      : '';
    const details = encodeURIComponent(this.event.description || `Event by ${this.event.kommunity.name}`);

    const url = `https://calendar.yahoo.com/?title=${eventName}&st=${startDate}&et=${endDate}&desc=${details}&in_loc=${location}`;
    window.open(url, '_blank');
  }
}
