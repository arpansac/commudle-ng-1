import { ActivatedRoute, Router } from '@angular/router';
import { Component, ElementRef, OnInit, OnDestroy, ViewChild, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ICommunityGroup } from 'apps/shared-models/community-group.model';
import { SeoService } from 'apps/shared-services/seo.service';
import { Subscription, map } from 'rxjs';
import {
  faUserGroup,
  faCircleInfo,
  faComments,
  faHashtag,
  faCalendarWeek,
  faArrowTrendUp,
  faBuilding,
  faPencil,
  faCaretDown,
  faGlobe,
} from '@fortawesome/free-solid-svg-icons';
import { faTwitter, faLinkedinIn, faFacebookF, faGithub } from '@fortawesome/free-brands-svg-icons';
import { CommunityGroupsService } from 'apps/commudle-admin/src/app/services/community-groups.service';
import { NbMenuService } from '@commudle/theme';
import { CustomPageService } from 'apps/commudle-admin/src/app/services/custom-page.service';
import { EDbModels } from '@commudle/shared-models';

interface CustomMenuItem {
  title: string;
  slug: string;
}

@Component({
  selector: 'app-community-group-home',
  templateUrl: './community-group-home.component.html',
  styleUrls: ['./community-group-home.component.scss'],
  standalone: false,
})
export class CommunityGroupHomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('stickySentinel') stickySentinel: ElementRef;
  communityGroup: ICommunityGroup;
  subscriptions: Subscription[] = [];
  isOrganizer = false;
  isMenuSticky = false;
  private observer: IntersectionObserver;
  private isBrowser: boolean;

  //icons
  faUserGroup = faUserGroup;
  faCircleInfo = faCircleInfo;
  faTwitter = faTwitter;
  faLinkedinIn = faLinkedinIn;
  faFacebookF = faFacebookF;
  faGithub = faGithub;
  faGlobe = faGlobe;
  faComments = faComments;
  faHashtag = faHashtag;
  faCalendarWeek = faCalendarWeek;
  faArrowTrendUp = faArrowTrendUp;
  faBuilding = faBuilding;
  faPencil = faPencil;
  faCaretDown = faCaretDown;

  items = [{ title: 'pages', slug: 'pages' }];

  EDbModels = EDbModels;

  constructor(
    private activatedRoute: ActivatedRoute,
    private seoService: SeoService,
    private communityGroupsService: CommunityGroupsService,
    private nbMenuService: NbMenuService,
    private customPageService: CustomPageService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.items = [];
    this.subscriptions.push(
      this.activatedRoute.data.subscribe((data) => {
        this.communityGroup = data.community_group;
        this.setMeta();
        this.checkOrganizer();
        this.getCustomPages();
      }),
    );
  }

  getCustomPages() {
    this.subscriptions.push(
      this.customPageService.getPIndex(this.communityGroup.slug, EDbModels.COMMUNITY_GROUP).subscribe((data) => {
        this.items = [];
        for (const page of data) {
          const newItem = { title: page.title, slug: page.slug };
          this.items.push(newItem);
        }
      }),
    );
    this.nbMenuService
      .onItemClick()
      .pipe(map(({ item }) => item as CustomMenuItem))
      .subscribe(({ title, slug }) => {
        this.router.navigate(['orgs', this.communityGroup.slug, 'p', slug]);
      });
  }

  ngAfterViewInit() {
    if (this.isBrowser && this.stickySentinel) {
      this.observer = new IntersectionObserver(
        ([entry]) => {
          this.isMenuSticky = !entry.isIntersecting;
        },
        { threshold: [0] },
      );
      this.observer.observe(this.stickySentinel.nativeElement);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
    this.observer?.disconnect();
  }

  checkOrganizer() {
    this.subscriptions.push(
      this.communityGroupsService.userManagedCommunityGroups$.subscribe((data: ICommunityGroup[]) => {
        if (data.find((communityGroupData) => communityGroupData.slug === this.communityGroup.slug) !== undefined) {
          this.isOrganizer = true;
        }
      }),
    );
  }

  setMeta(): void {
    this.seoService.setTags(
      this.communityGroup.name,
      this.communityGroup.mini_description,
      this.communityGroup.logo.i350,
    );
  }
}
