import { Component, Input, OnInit } from '@angular/core';
import { IEvent } from '@commudle/shared-models';

@Component({
  selector: 'commudle-community-events-list-public-page',
  templateUrl: './community-events-list-public-page.component.html',
  styleUrls: ['./community-events-list-public-page.component.scss'],
})
export class CommunityEventsListPublicPageComponent implements OnInit {
  @Input() value: string | number;
  @Input() eventData: IEvent;

  constructor() {}

  ngOnInit(): void {}
}
