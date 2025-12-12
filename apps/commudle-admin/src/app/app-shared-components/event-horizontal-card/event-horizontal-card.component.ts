import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NbButtonModule, NbCardModule, NbIconModule } from '@commudle/theme';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IEvent } from 'apps/shared-models/event.model';
import * as moment from 'moment';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { ICommunity } from 'apps/shared-models/community.model';
import { CommunitiesService } from 'apps/commudle-admin/src/app/services/communities.service';
import { SharedDirectivesModule } from 'apps/shared-directives/shared-directives.module';
import * as momentTimezone from 'moment-timezone';

@Component({
  selector: 'commudle-event-horizontal-card',
  standalone: true,
  templateUrl: './event-horizontal-card.component.html',
  styleUrls: ['./event-horizontal-card.component.scss'],
  imports: [
    CommonModule,
    FontAwesomeModule,
    RouterModule,
    NbButtonModule,
    NbCardModule,
    NbIconModule,
    SharedComponentsModule,
    SharedDirectivesModule,
  ],
})
export class EventHorizontalCardComponent implements OnInit {
  @Input() event: IEvent;
  @Input() headerImageWidth = '388px';
  community: ICommunity;
  moment = moment;
  tags: string[] = [];
  momentTimezone = momentTimezone;

  constructor(private communitiesService: CommunitiesService) {}

  ngOnInit(): void {
    this.getCommunity();
  }

  getCommunity() {
    this.communitiesService
      .pGetCommunityDetails(this.event.kommunity_id || this.event.kommunity.id)
      .subscribe((data) => {
        this.community = data;
      });
  }

  getTagNames() {
    this.tags = Object.values(this.event.tags).map((tag) => tag.name);
    return this.tags;
  }
}
