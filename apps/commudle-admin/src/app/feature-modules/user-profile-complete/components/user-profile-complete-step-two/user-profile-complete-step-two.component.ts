import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, GoogleTagManagerService } from '@commudle/shared-services';
import { UserProfileManagerService } from 'apps/commudle-admin/src/app/feature-modules/users/services/user-profile-manager.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { AppUsersService } from 'apps/commudle-admin/src/app/services/app-users.service';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import * as confetti from 'canvas-confetti';
import { ProfileStatusBarService } from 'apps/commudle-admin/src/app/services/profile-status-bar.service';
import { IAttachedFile, IUser } from '@commudle/shared-models';
import { ICurrentUser } from 'apps/shared-models/current_user.model';

@Component({
    selector: 'commudle-user-profile-complete-step-two',
    templateUrl: './user-profile-complete-step-two.component.html',
    styleUrls: ['./user-profile-complete-step-two.component.scss'],
    standalone: false
})
export class UserProfileCompleteStepTwoComponent implements OnInit, OnDestroy {
  validBasicDetailsStatus: boolean;
  validUsername = true;
  currentUser: ICurrentUser;
  profileStepOneForm: FormGroup;
  user: IUser;
  fileName: string;
  uploadedResume: IAttachedFile;
  staticAssets = staticAssets;
  faArrowRight = faArrowRight;
  subscriptions: Subscription[] = [];
  canvas = <HTMLCanvasElement>document.getElementById('confetti');
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private userProfileManagerService: UserProfileManagerService,
    private gtm: GoogleTagManagerService,
    private fb: FormBuilder,
    private authWatchService: AuthService,
    private usersService: AppUsersService,
    private profileStatusBarService: ProfileStatusBarService,
  ) {
    {
      this.profileStepOneForm = this.fb.group({
        name: ['', Validators.required],
      });
    }
  }

  ngOnInit(): void {
    this.profileStatusBarService.changeProfileBarStatus(false);
    this.authWatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((currentUser) => {
      if (currentUser) {
        this.usersService.getProfile(currentUser.username).subscribe((data) => {
          if (data) {
            this.user = data;
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.profileStatusBarService.changeProfileBarStatus(true);
  }

  checkUsername(validUsername) {
    this.validUsername = validUsername;
  }

  checkBasicDetailsValidity(status: boolean) {
    this.validBasicDetailsStatus = status;
  }

  submitStepTwo() {
    this.userProfileManagerService.setUpdateUsername(true);
    this.userProfileManagerService.updateUserDetails(false);
    if (this.currentUser) {
      this.gtm.dataLayerPushEvent('complete_your_profile_step_two', {
        com_name: this.currentUser.name,
        com_tagline: this.currentUser.designation,
        com_gender: this.currentUser.gender,
      });
    }
    confetti.create(this.canvas, { resize: true })({
      shapes: ['square', 'circle', 'star'],
      particleCount: 1000,
      spread: 360,
      zIndex: 9999,
      disableForReducedMotion: true,
      ticks: 500,
    });
    this.goToNextStep();
  }

  gtmServiceData(userData) {
    this.currentUser = userData;
  }

  goToNextStep() {
    this.router.navigate(['/user-profile-complete/step-three']);
  }

  goToPreviousStep() {
    this.router.navigate(['/user-profile-complete/step-one']);
  }
}
