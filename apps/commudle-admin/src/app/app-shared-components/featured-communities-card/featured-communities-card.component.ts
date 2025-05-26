import { Component, Input, OnInit } from '@angular/core';
import { NbButtonModule, NbIconModule } from '@commudle/theme';
import { faCheck, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { PublicCommunityModule } from 'apps/commudle-admin/src/app/feature-modules/public-community/public-community.module';
import { ICommunity } from 'apps/shared-models/community.model';
@Component({
  selector: 'commudle-featured-communities-card',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    RouterModule,
    NbButtonModule,
    SharedComponentsModule,
    PublicCommunityModule,
    NbIconModule,
  ],
  templateUrl: './featured-communities-card.component.html',
  styleUrls: ['./featured-communities-card.component.scss'],
})
export class FeaturedCommunitiesCardComponent implements OnInit {
  @Input() featuredCommunity: ICommunity;
  @Input() communityFeaturedReason: string;
  @Input() horizontalScroll = false;
  @Input() showJoinBtnBottom = false;
  faCheck = faCheck;
  faPlus = faPlus;
  constructor() {}

  ngOnInit(): void {}
}
