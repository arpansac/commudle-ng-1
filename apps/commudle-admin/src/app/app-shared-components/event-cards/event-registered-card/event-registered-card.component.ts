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
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import { ShareService } from '@commudle/shared-services';
import { environment } from '@commudle/shared-environments';

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
  readonly icons = {
    faCalendarDays,
    faLocationDot,
    faCalendarPlus,
    faShareNodes,
    faArrowUpRightFromSquare,
    faCircleCheck,
  };
  constructor(private eventService: EventsService, private shareService: ShareService) {}

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
}
