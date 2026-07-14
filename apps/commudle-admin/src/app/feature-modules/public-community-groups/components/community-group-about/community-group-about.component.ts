import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ICommunityGroup } from 'apps/shared-models/community-group.model';
import { SeoService } from 'apps/shared-services/seo.service';
import { Subscription } from 'rxjs';
import { faTwitter, faLinkedinIn, faFacebookF, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faGlobe, faCircleInfo } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-community-group-about',
  templateUrl: './community-group-about.component.html',
  styleUrls: ['./community-group-about.component.scss'],
  standalone: false,
})
export class CommunityGroupAboutComponent implements OnInit, OnDestroy {
  communityGroup: ICommunityGroup;
  description;
  faTwitter = faTwitter;
  faLinkedinIn = faLinkedinIn;
  faFacebookF = faFacebookF;
  faGithub = faGithub;
  faGlobe = faGlobe;
  faCircleInfo = faCircleInfo;

  subscriptions: Subscription[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private activatedRoute: ActivatedRoute,
    private seoService: SeoService,
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.activatedRoute.parent.data.subscribe((data) => {
        this.communityGroup = data.community_group;
        this.description = this.sanitizer.bypassSecurityTrustHtml(this.communityGroup.description);
        this.setMeta();
      }),
    );
  }

  setMeta(): void {
    this.seoService.setTags(
      `About | ${this.communityGroup.name}`,
      this.communityGroup.mini_description,
      this.communityGroup.logo.i350,
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }
}
