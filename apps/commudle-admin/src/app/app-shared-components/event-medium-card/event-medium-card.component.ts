import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NbButtonModule, NbIconModule } from '@commudle/theme';
import { CommudleCardModule } from '@commudle/commudle-theme';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { IEvent } from 'apps/shared-models/event.model';
import * as moment from 'moment';
import { faUserGroup, faMapPin } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'commudle-event-medium-card',
  templateUrl: './event-medium-card.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CommudleCardModule,
    SharedComponentsModule,
    NbButtonModule,
    FontAwesomeModule,
    NbIconModule,
  ],
  styleUrls: ['./event-medium-card.component.scss'],
})
export class EventMediumCardComponent {
  @Input() event: IEvent;
  @Input() width: string;
  moment = moment;

  faUserGroup = faUserGroup;
  faMapPin = faMapPin;
}
