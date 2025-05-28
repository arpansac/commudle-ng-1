import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'commudle-community-mails-sent-stats',
  templateUrl: './community-mails-sent-stats.component.html',
  styleUrls: ['./community-mails-sent-stats.component.scss'],
})
export class CommunityMailsSentStatsComponent implements OnInit {
  communityId: number | string;
  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.parent.params.subscribe((params) => {
      this.communityId = params.community_id;
    });
  }
}
