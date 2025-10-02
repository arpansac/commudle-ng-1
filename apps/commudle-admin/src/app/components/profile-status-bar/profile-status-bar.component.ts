import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GoogleTagManagerService } from 'apps/commudle-admin/src/app/services/google-tag-manager.service';
import { ProfileStatusBarService } from 'apps/commudle-admin/src/app/services/profile-status-bar.service';
import { StepperService } from 'apps/commudle-admin/src/app/services/stepper.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-profile-status-bar',
    templateUrl: './profile-status-bar.component.html',
    styleUrls: ['./profile-status-bar.component.scss'],
    standalone: false
})
export class ProfileStatusBarComponent implements OnInit, OnDestroy {
  value = 0;
  private subscription: Subscription;

  constructor(
    private stepperService: StepperService,
    private profileStatusBarService: ProfileStatusBarService,
    private activatedRoute: ActivatedRoute,
    private gtm: GoogleTagManagerService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.stepperService.getProfilePercentage();
    this.subscription = this.stepperService.profileCompletePercentage$.subscribe((percentage) => {
      this.value = percentage;
      if (percentage >= 90) {
        this.profileStatusBarService.changeProfileBarStatus(false);
      } else {
        this.profileStatusBarService.changeProfileBarStatus(true);
      }
    });
  }

  showStepper() {
    this.gtm.dataLayerPushEvent('click_open_complete_profile_popup', {});
    const currentUrl = this.router.url;
    this.profileStatusBarService.setReferrerUrl(currentUrl);
    this.router.navigate(['/user-profile-complete/step-one']);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
