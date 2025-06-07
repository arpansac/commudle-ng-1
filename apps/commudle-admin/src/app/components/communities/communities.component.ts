import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NbIconModule } from '@commudle/theme';
import { FooterService } from 'apps/commudle-admin/src/app/services/footer.service';
import { AppSharedComponentsModule } from '../../app-shared-components/app-shared-components.module';
import { ListingPageHeaderComponent } from '../../app-shared-components/listing-page-header/listing-page-header.component';
import { ListingPagesLayoutComponent } from '../../app-shared-components/listing-pages-layout/listing-pages-layout.component';
import { PublicHomeListEventsModule } from '../../feature-modules/listing-pages/public-home-list-events/public-home-list-events.module';
import { PublicHomeListSpeakersModule } from '../../feature-modules/listing-pages/public-home-list-speakers/public-home-list-speakers.module';
import { CommunitiesFeaturedComponent } from './communities-featured/communities-featured.component';
import { CommunitiesListComponent } from './communities-list/communities-list.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-communities',
  templateUrl: './communities.component.html',
  styleUrls: ['./communities.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NbIconModule,
    PublicHomeListSpeakersModule,
    AppSharedComponentsModule,
    PublicHomeListEventsModule,
    ListingPagesLayoutComponent,
    ListingPageHeaderComponent,
    CommunitiesFeaturedComponent,
    CommunitiesListComponent,
  ],
})
export class CommunitiesComponent implements OnInit, OnDestroy {
  isMobileView: boolean;

  constructor(private footerService: FooterService) {}

  ngOnInit(): void {
    this.footerService.changeFooterStatus(true);
    this.isMobileView = window.innerWidth <= 640;
  }

  ngOnDestroy(): void {
    this.footerService.changeFooterStatus(false);
  }
}
