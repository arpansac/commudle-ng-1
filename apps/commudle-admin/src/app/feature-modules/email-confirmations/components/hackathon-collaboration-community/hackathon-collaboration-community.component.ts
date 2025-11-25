import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HackathonCollaborationCommunitiesService } from '@commudle/shared-services';
import { IHackathonCollaborationCommunity, EHackathonCollaborationCommunityStatus } from '@commudle/shared-models';
import { SeoService } from '@commudle/shared-services';
import { faCheckCircle, faTimesCircle, faRocket, faUsers, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'commudle-hackathon-collaboration-community',
  templateUrl: './hackathon-collaboration-community.component.html',
  styleUrls: ['./hackathon-collaboration-community.component.scss'],
})
export class HackathonCollaborationCommunityComponent implements OnInit, OnDestroy {
  hackathonCollaboration: IHackathonCollaborationCommunity;
  EHackathonCollaborationCommunityStatus = EHackathonCollaborationCommunityStatus;
  collaborationToken: string;
  status: EHackathonCollaborationCommunityStatus;

  readonly icons = {
    faCheckCircle,
    faTimesCircle,
    faRocket,
    faUsers,
    faExternalLinkAlt,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private hackathonCollaborationCommunitiesService: HackathonCollaborationCommunitiesService,
    private seoService: SeoService,
  ) {}

  ngOnInit() {
    this.seoService.noIndex(true);
    this.activatedRoute.queryParams.subscribe((data) => {
      this.collaborationToken = data.token;
      this.status = data.status;
      if (this.status) {
        this.updateStatus();
      } else {
        this.status = EHackathonCollaborationCommunityStatus.APPROVED;
        this.updateStatus();
      }
    });

    this.seoService.setTitle('Confirm Hackathon Collaboration');
  }

  ngOnDestroy() {
    this.seoService.noIndex(false);
  }

  updateStatus() {
    this.hackathonCollaborationCommunitiesService.updateStatus(this.collaborationToken, this.status).subscribe({
      next: (data: IHackathonCollaborationCommunity) => {
        this.hackathonCollaboration = data;
      },
      error: (data) => {
        this.hackathonCollaboration = data.error.data;
      },
    });
  }
}
