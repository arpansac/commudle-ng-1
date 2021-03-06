import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ICommunityGroup } from 'projects/shared-models/community-group.model';
import { CommunityGroupsService } from 'projects/commudle-admin/src/app/services/community-groups.service';
import { FooterService } from 'projects/commudle-admin/src/app/services/footer.service';

@Component({
  selector: 'app-community-group-home',
  templateUrl: './community-group-home.component.html',
  styleUrls: ['./community-group-home.component.scss']
})
export class CommunityGroupHomeComponent implements OnInit, OnDestroy {
  communityGroup: ICommunityGroup;
  private subscriptions = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private footerService: FooterService,
  ) { }

  ngOnInit() {
    this.footerService.changeFooterStatus(false);
    this.subscriptions.push(this.activatedRoute.data.subscribe(
      data => {
        this.communityGroup = data.community_group;
      }
    ));
  }

  ngOnDestroy() {
    this.footerService.changeFooterStatus(true);

    for (let sub of this.subscriptions) {
      sub.unsubscribe();
    }
  }





}
