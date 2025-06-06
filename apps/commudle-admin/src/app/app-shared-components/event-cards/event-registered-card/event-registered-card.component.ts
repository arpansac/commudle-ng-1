import { Component, OnInit, Input } from '@angular/core';
import { IEvent } from '@commudle/shared-models';
import * as moment from 'moment';

@Component({
  selector: 'commudle-event-registered-card',
  templateUrl: './event-registered-card.component.html',
  styleUrls: ['./event-registered-card.component.scss'],
})
export class EventRegisteredCardComponent implements OnInit {
  @Input() event: IEvent;
  moment = moment;

  ngOnInit(): void {}
}
