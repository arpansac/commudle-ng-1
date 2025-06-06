import { Component, Input, OnInit } from '@angular/core';
import { IEvent } from '@commudle/shared-models';
import * as moment from 'moment';

@Component({
  selector: 'commudle-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss'],
})
export class EventCardComponent implements OnInit {
  @Input() event: IEvent;
  moment = moment;

  ngOnInit(): void {}
}
