import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NbIconModule } from '@commudle/theme';
import { FeaturedItemsService } from 'apps/commudle-admin/src/app/services/featured-items.service';
import { environment } from 'apps/commudle-admin/src/environments/environment';
import { IFeaturedItems } from 'apps/shared-models/featured-items.model';
import { Subscription } from 'rxjs';
import { SharedComponentsModule } from '../../../../../../shared-components/shared-components.module';
import { PublicCommunityModule } from '../../../feature-modules/public-community/public-community.module';
import { SkeletonVerticalCardsComponent } from '../../../feature-modules/skeleton-screens/components/skeleton-vertical-cards/skeleton-vertical-cards.component';

@Component({
  selector: 'app-communities-featured',
  templateUrl: './communities-featured.component.html',
  styleUrls: ['./communities-featured.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SkeletonVerticalCardsComponent,
    SharedComponentsModule,
    NbIconModule,
    PublicCommunityModule,
  ],
})
export class CommunitiesFeaturedComponent implements OnInit, OnDestroy {
  featuredItems: IFeaturedItems[] = [];
  environment = environment;
  communityTagsLength: number;
  tags: string[] = [];
  skeletonLoaderCard = true;

  subscription: Subscription;

  constructor(private featuredItemsService: FeaturedItemsService) {}

  ngOnInit(): void {
    this.getFeaturedCommunities();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  getFeaturedCommunities(): void {
    this.subscription = this.featuredItemsService.getFeaturedItems('Kommunity').subscribe((data) => {
      this.featuredItems = this.featuredItems.concat(data.page.reduce((acc, value) => [...acc, value.data], []));
      this.skeletonLoaderCard = false;
    });
  }

  getTagNames(community) {
    this.tags = community.tags.map((tag) => tag.name);
    return this.tags;
  }
}
