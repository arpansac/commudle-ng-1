import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommunityGroupsService } from 'apps/commudle-admin/src/app/services/community-groups.service';
import { ICommunityGroup } from 'apps/shared-models/community-group.model';
import { IHackathon } from 'apps/shared-models/hackathon.model';
import { SeoService } from '@commudle/shared-services';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'commudle-community-group-hackathons',
  templateUrl: './hackathons.component.html',
  styleUrls: ['./hackathons.component.scss'],
  standalone: false,
})
export class HackathonsComponent implements OnInit, OnDestroy {
  communityGroup: ICommunityGroup;
  hackathons: IHackathon[];
  subscriptions: Subscription[] = [];
  moment = moment;
  faTrophy = faTrophy;

  isLoading = false;
  count = 10;
  page = 1;
  total = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private communityGroupsService: CommunityGroupsService,
    private seoService: SeoService,
  ) {}

  ngOnInit(): void {
    this.seoService.noIndex(true);
    this.subscriptions.push(
      this.activatedRoute.parent.data.subscribe((data) => {
        this.communityGroup = data.community_group;
        this.getHackathons();
        this.setMeta();
      }),
    );
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  setMeta() {
    this.seoService.setTags(
      `Hackathons - Admin - ${this.communityGroup.name}`,
      this.communityGroup.mini_description,
      this.communityGroup.logo.i320,
    );
  }

  getHackathons() {
    this.isLoading = true;
    this.subscriptions.push(
      this.communityGroupsService.pHackathons(this.communityGroup.slug, this.page, this.count).subscribe((data) => {
        this.hackathons = data.values;
        console.log(this.hackathons);
        this.total = data.total;
        this.page = data.page;
        this.count = data.count;
        this.isLoading = false;
      }),
    );
  }
}
