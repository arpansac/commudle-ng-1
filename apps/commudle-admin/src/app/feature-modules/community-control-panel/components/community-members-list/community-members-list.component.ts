import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommunitiesService } from 'apps/commudle-admin/src/app/services/communities.service';
import { NbToastrService } from '@commudle/theme';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-community-members-list',
  templateUrl: './community-members-list.component.html',
  styleUrls: ['./community-members-list.component.scss'],
})
export class CommunityMembersListComponent implements OnInit {
  sendingRequest = false;
  faEnvelope = faEnvelope;
  isBlockedTab = false;

  constructor(
    private communityService: CommunitiesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastrService: NbToastrService,
  ) {}

  ngOnInit() {
    this.checkCurrentRoute();
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.checkCurrentRoute();
    });
  }

  private checkCurrentRoute() {
    const currentUrl = this.router.url;
    this.isBlockedTab = currentUrl.includes('/blocked');
  }

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
