import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IEvent } from 'apps/shared-models/event.model';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { NbButtonModule, NbCardModule, NbIconModule } from '@commudle/theme';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import * as moment from 'moment';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { ICommunity } from 'apps/shared-models/community.model';
import { CommunitiesService } from 'apps/commudle-admin/src/app/services/communities.service';
import { environment } from '@commudle/shared-environments';

@Component({
  selector: 'commudle-event-mini-card',
  standalone: true,
  templateUrl: './event-mini-card.component.html',
  styleUrls: ['./event-mini-card.component.scss'],
  imports: [
    CommonModule,
    NbCardModule,
    RouterModule,
    FontAwesomeModule,
    SharedComponentsModule,
    NbButtonModule,
    NbIconModule,
  ],
})
export class EventMiniCardComponent implements OnInit {
  @Input() attendedEvent: IEvent;
  @Input() cardType: string;
  @Input() iconSize: 'small' | 'medium' = 'small';
  @Input() showCardHorizontal = false;
  community: ICommunity;
  faCheck = faCheck;
  environment = environment;
  moment = moment;

  constructor(private communitiesService: CommunitiesService) {}

  ngOnInit(): void {
    this.getCommunity();
  }

  getCommunity() {
    if (this.attendedEvent && this.attendedEvent.community) {
      this.communitiesService.pGetCommunityDetails(this.attendedEvent.community.slug).subscribe((data) => {
        this.community = data;
      });
    }
  }
}
