import { EEventStatuses } from 'apps/shared-models/enums/event_statuses.enum';
import { Component, OnInit, Input } from '@angular/core';
import { IEvent } from 'apps/shared-models/event.model';
import * as moment from 'moment';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-community-events-list-date',
  templateUrl: './community-events-list-date.component.html',
  styleUrls: ['./community-events-list-date.component.scss'],
})
export class CommunityEventsListDateComponent implements OnInit {
  @Input() value: string | number;
  @Input() eventData: IEvent;
  EEventStatuses = EEventStatuses;
  faArrowRight = faArrowRight;

  moment = moment;

  constructor() {}

  ngOnInit(): void {}
}
