import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GoogleTagManagerService } from '@commudle/shared-services';
import { UserProfileManagerService } from 'apps/commudle-admin/src/app/feature-modules/users/services/user-profile-manager.service';
import { ICurrentUser } from 'apps/shared-models/current_user.model';
import { LibAuthwatchService } from 'apps/shared-services/lib-authwatch.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { AppUsersService } from 'apps/commudle-admin/src/app/services/app-users.service';
import { IUser } from 'apps/shared-models/user.model';
import { IAttachedFile } from 'apps/shared-models/attached-file.model';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-user-profile-complete-step-two',
  templateUrl: './user-profile-complete-step-two.component.html',
  styleUrls: ['./user-profile-complete-step-two.component.scss'],
})
export class UserProfileCompleteStepTwoComponent implements OnInit, OnDestroy {
  validBasicDetailsStatus: boolean;
  validUsername = true;
  currentUser: ICurrentUser;
  profileStepOneForm;
  user: IUser;
  fileName: string;
  uploadedResume: IAttachedFile;
  staticAssets = staticAssets;
  faArrowRight = faArrowRight;
  subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private userProfileManagerService: UserProfileManagerService,
    private gtm: GoogleTagManagerService,
    private fb: FormBuilder,
    private authWatchService: LibAuthwatchService,
    private usersService: AppUsersService,
  ) {
    {
      this.profileStepOneForm = this.fb.group({
        name: ['', Validators.required],
      });
    }
  }

  ngOnInit(): void {
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
