import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SeoService } from 'apps/shared-services/seo.service';
@Component({
  selector: 'commudle-admin-community-hackathon',
  templateUrl: './admin-community-hackathon.component.html',
  styleUrls: ['./admin-community-hackathon.component.scss'],
})
export class AdminCommunityHackathonComponent implements OnInit, OnDestroy {
  parentId: number;
  constructor(private activatedRoute: ActivatedRoute, private seoService: SeoService) {}

  ngOnInit() {
    this.parentId = this.activatedRoute.parent.parent.snapshot.params.community_id;
    this.seoService.setTitle(`Hackathons | Admin Dashboard `);
    this.seoService.noIndex(true);
  }
  ngOnDestroy() {
    this.seoService.noIndex(false);
  }
}
