import { Component, Input, OnInit } from '@angular/core';
import { CBuildTypeDisplay, ICommunityBuild } from 'apps/shared-models/community-build.model';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';
import * as moment from 'moment';
import { Router } from '@angular/router';

@Component({
    selector: 'app-community-build-card',
    templateUrl: './community-build-card.component.html',
    styleUrls: ['./community-build-card.component.scss'],
    standalone: false
})
export class CommunityBuildCardComponent implements OnInit {
  @Input() communityBuild: ICommunityBuild;
  staticAssets = staticAssets;
  moment = moment;

  CBuildTypeDisplay = CBuildTypeDisplay;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  onNavigate() {
    setTimeout(() => {
      this.router.navigate(['/builds', this.communityBuild.slug]);
    }, 100);
  }
}
