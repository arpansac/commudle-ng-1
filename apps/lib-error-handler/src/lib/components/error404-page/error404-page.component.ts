import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FooterService } from 'apps/commudle-admin/src/app/services/footer.service';
import { ProfileStatusBarService } from 'apps/commudle-admin/src/app/services/profile-status-bar.service';
import { SeoService } from '@commudle/shared-services';

@Component({
  selector: 'lib-error404-page',
  templateUrl: './error404-page.component.html',
  styleUrls: ['./error404-page.component.scss'],
})
export class Error404PageComponent implements OnInit, OnDestroy {
  constructor(
    private profileStatusBarService: ProfileStatusBarService,
    private footerService: FooterService,
    private seoService: SeoService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.footerService.changeFooterStatus(true);
    this.profileStatusBarService.changeProfileBarStatus(false);

    const currentUrl = this.router.url;
    const statusCode = currentUrl.includes('/410') ? '410' : '404';

    this.seoService.setTag('prerender-status-code', statusCode);

    this.seoService.setTags(
      'Page Not Found - Commudle',
      'The page you are looking for could not be found.',
      'https://commudle.com/assets/images/commudle-logo192.png',
    );
  }

  ngOnDestroy(): void {
    this.footerService.changeFooterStatus(false);
    this.profileStatusBarService.changeProfileBarStatus(true);

    // Remove prerender-status-code meta tag when component is destroyed
    this.seoService.removeTag('prerender-status-code');
  }
}
