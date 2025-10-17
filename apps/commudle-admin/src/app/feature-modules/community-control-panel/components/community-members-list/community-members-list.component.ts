import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommunitiesService } from 'apps/commudle-admin/src/app/services/communities.service';
import { NbToastrService } from '@commudle/theme';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-community-members-list',
  templateUrl: './community-members-list.component.html',
  styleUrls: ['./community-members-list.component.scss'],
})
export class CommunityMembersListComponent {
  sendingRequest = false;
  faEnvelope = faEnvelope;

  constructor(
    private communityService: CommunitiesService,
    private activatedRoute: ActivatedRoute,
    private toastrService: NbToastrService,
  ) {}

  sendSpeakerCSV() {
    this.sendingRequest = true;
    this.communityService
      .sendCsvSpeakersList(this.activatedRoute.parent.snapshot.params['community_id'])
      .subscribe((data) => {
        if (data) {
          this.toastrService.success('CSV will be sent to your email inbox');
          this.sendingRequest = false;
        }
      });
  }
}
