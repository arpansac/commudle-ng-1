import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventCollaborationCommunitiesService } from 'apps/commudle-admin/src/app/services/event-collaboration-communities.service';
import { ICommunity } from 'apps/shared-models/community.model';
import {
  IEventCollaborationCommunity,
  EEventCollaborationCommunityStatus,
} from 'apps/shared-models/event_collaboration_community.model';
import { SeoService } from 'apps/shared-services/seo.service';

@Component({
    selector: 'app-collaboration-community',
    templateUrl: './collaboration-community.component.html',
    styleUrls: ['./collaboration-community.component.scss'],
    standalone: false
})
export class CollaborationCommunityComponent implements OnInit, OnDestroy {
  eventCollaboration: IEventCollaborationCommunity;
  EEventCollaborationCommunityStatus = EEventCollaborationCommunityStatus;
  community: ICommunity;
  collaborationToken: string;
  status: EEventCollaborationCommunityStatus;

  constructor(
    private activatedRoute: ActivatedRoute,
    private eventCollaborationCommunitiesService: EventCollaborationCommunitiesService,
    private seoService: SeoService,
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((data) => {
      // this.confirmCollaboration(data.token);
      this.collaborationToken = data.token;
      this.status = data.status;
      if (this.status) {
        this.updateStatus();
      } else {
        this.confirmCollaboration();
      }
    });

    this.seoService.setTitle('Confirm Collaboration');
    this.seoService.noIndex(true);
  }

  ngOnDestroy() {
    this.seoService.noIndex(false);
  }

  confirmCollaboration() {
    this.eventCollaborationCommunitiesService.confirmCollaboration(this.collaborationToken).subscribe((data) => {
      this.eventCollaboration = data.event_collaboration_community;
      this.community = data.community;
    });
  }

  updateStatus() {
    this.eventCollaborationCommunitiesService.updateStatus(this.collaborationToken, this.status).subscribe((data) => {
      this.eventCollaboration = data.event_collaboration_community;
      this.community = data.community;
    });
  }
}
