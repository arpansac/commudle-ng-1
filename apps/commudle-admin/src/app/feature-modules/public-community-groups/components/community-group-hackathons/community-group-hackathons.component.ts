import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EDbModels } from '@commudle/shared-models';
import { SeoService } from '@commudle/shared-services';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { ICommunityGroup } from 'apps/shared-models/community-group.model';
import { IHackathon } from 'apps/shared-models/hackathon.model';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

@Component({
  selector: 'commudle-community-group-hackathons',
  templateUrl: './community-group-hackathons.component.html',
  styleUrls: ['./community-group-hackathons.component.scss'],
  standalone: false,
})
export class CommunityGroupHackathonsComponent implements OnInit, OnDestroy {
  communityGroup: ICommunityGroup;
  upcomingHackathons: IHackathon[] = [];
  pastHackathons: IHackathon[] = [];
  subscriptions: Subscription[] = [];
  isLoadingUpcoming = false;
  isLoadingPast = false;
  faCalendarDays = faCalendarDays;

  constructor(
    private activatedRoute: ActivatedRoute,
    private hackathonService: HackathonService,
    private seoService: SeoService,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.activatedRoute.parent.data.subscribe((data) => {
        this.communityGroup = data.community_group;
        this.getUpcomingHackathons();
        this.getPastHackathons();
        this.setMeta();
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  getUpcomingHackathons() {
    this.isLoadingUpcoming = true;
    this.subscriptions.push(
      this.hackathonService.pIndexHackathons(this.communityGroup.id, 'CommunityGroup', 'future').subscribe((data) => {
        this.upcomingHackathons = data.values;
        this.isLoadingUpcoming = false;
      }),
    );
  }

  getPastHackathons() {
    this.isLoadingPast = true;
    this.subscriptions.push(
      this.hackathonService.pIndexHackathons(this.communityGroup.id, 'CommunityGroup', 'past').subscribe((data) => {
        this.pastHackathons = data.values;
        this.isLoadingPast = false;
      }),
    );
  }

  setMeta() {
    this.seoService.setTags(
      `Hackathons | ${this.communityGroup.name}`,
      this.communityGroup.mini_description,
      this.communityGroup.logo.i350,
    );
  }
}
