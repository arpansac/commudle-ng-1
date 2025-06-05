import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ICommunityGroup } from 'apps/shared-models/community-group.model';
import { SeoService } from 'apps/shared-services/seo.service';

@Component({
  selector: 'commudle-communities',
  templateUrl: './communities.component.html',
  styleUrls: ['./communities.component.scss'],
})
export class CommunitiesComponent implements OnInit, OnDestroy {
  communityGroup: ICommunityGroup;

  tabs = [
    {
      route: './',
      title: 'Communities',
      icon: 'people',
    },
    {
      route: 'events',
      title: 'Events',
      icon: 'calendar',
    },
    // {
    //   route: 'channels',
    //   title: 'Channels',
    //   icon: 'hash',
    // },
  ];

  constructor(private activatedRoute: ActivatedRoute, private seoService: SeoService) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe((data) => {
      this.communityGroup = data.community_group;
      this.setMeta();
    });
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
  }

  setMeta() {
    this.seoService.setTags(
      `Communities | Dashboard | ${this.communityGroup.name}`,
      this.communityGroup.mini_description,
      this.communityGroup.logo?.i350,
    );
    this.seoService.noIndex(true);
  }
}
