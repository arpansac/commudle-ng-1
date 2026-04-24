import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { FeaturedItemsService } from 'apps/commudle-admin/src/app/services/featured-items.service';
import { IFeaturedItems } from 'apps/shared-models/featured-items.model';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'commudle-public-home-list-events-featured-communities',
    templateUrl: './public-home-list-events-featured-communities.component.html',
    styleUrls: ['./public-home-list-events-featured-communities.component.scss'],
    standalone: false
})
export class PublicHomeListEventsFeaturedCommunitiesComponent implements OnInit, AfterViewInit {
  @Input() showCardsHorizontal = false;
  @Input() showIconsOnHeading = false;
  featuredCommunities: IFeaturedItems[] = [];
  showSpinner = false;
  isMobileView: boolean;
  faUserGroup = faUserGroup;
  private readonly isBrowser: boolean;

  constructor(private featuredItemsService: FeaturedItemsService, private activatedRoute: ActivatedRoute, @Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.isMobileView = this.isBrowser ? window.innerWidth <= 1024 : false;
    this.getFeaturedCommunities();
  }

  ngAfterViewInit() {
    // TODO optimize this
    this.activatedRoute.fragment.subscribe((fragment) => {
      if (fragment) {
        setTimeout(() => {
          const element = document.querySelector('#' + fragment);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
            });
          }
        }, 500);
      }
    });
  }

  getFeaturedCommunities(): void {
    this.showSpinner = true;
    this.featuredItemsService.getFeaturedItems('Kommunity').subscribe((data) => {
      this.featuredCommunities = this.featuredCommunities.concat(
        data.page.reduce((acc, value) => [...acc, value.data], []),
      );
      this.showSpinner = false;
    });
  }
}
