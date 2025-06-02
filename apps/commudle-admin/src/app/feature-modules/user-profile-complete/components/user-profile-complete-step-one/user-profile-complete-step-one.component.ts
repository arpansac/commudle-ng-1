import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { ICurrentUser } from 'apps/shared-models/current_user.model';
import { LibAuthwatchService } from 'apps/shared-services/lib-authwatch.service';
import { Subject, takeUntil } from 'rxjs';
import { AppUsersService } from 'apps/commudle-admin/src/app/services/app-users.service';
import { EDomain, EExperienceLevel } from '@commudle/shared-models';
import { UserProfileManagerService } from 'apps/commudle-admin/src/app/feature-modules/users/services/user-profile-manager.service';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';
import { KeyValue } from '@angular/common';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { ProfileStatusBarService } from 'apps/commudle-admin/src/app/services/profile-status-bar.service';

@Component({
  selector: 'app-user-profile-complete-step-one',
  templateUrl: './user-profile-complete-step-one.component.html',
  styleUrls: ['./user-profile-complete-step-one.component.scss'],
})
export class UserProfileCompleteStepOneComponent implements OnInit, OnDestroy {
  currentUser: ICurrentUser;
  goals = [];
  tags = [];
  EExperienceLevel = EExperienceLevel;
  EDomain = EDomain;
  showGoalsError = false;
  showSkillsError = false;
  showExperienceLevelError = false;
  showDomainError = false;
  profileStepOneForm;
  staticAssets = staticAssets;
  faArrowRight = faArrowRight;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authWatchService: LibAuthwatchService,
    private appUsersService: AppUsersService,
    private usersService: AppUsersService,
    private userProfileManagerService: UserProfileManagerService,
    private fb: FormBuilder,
    private profileStatusBarService: ProfileStatusBarService,
  ) {
    this.profileStepOneForm = this.fb.group({
      experience_level: ['', Validators.required],
      user_domain: ['', Validators.required],
      goals: [[]],
    });
  }

  ngOnInit() {
    this.profileStatusBarService.changeProfileBarStatus(false);
    this.authWatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data) {
        this.currentUser = data;

        this.profileStepOneForm.patchValue({
          experience_level: data.experience_level || '',
          user_domain: data.user_domain || '',
          goals: data.goals || [],
        });

        this.tags = [];
        if (data.tags && data.tags.length > 0) {
          data.tags.forEach((tag) => {
            if (tag.name) {
              this.tags.push(tag.name);
            }
          });
        }

        this.getGoals();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.profileStatusBarService.changeProfileBarStatus(true);
  }

  originalOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return 0;
  };

  getGoals() {
    this.appUsersService.getMyGoals().subscribe((data) => {
      this.goals = data;
    });
  }

  toggleGoal(goal: string) {
    const currentGoals = this.profileStepOneForm.get('goals').value || [];
    if (currentGoals.includes(goal)) {
      const updatedGoals = currentGoals.filter((g) => g !== goal);
      this.profileStepOneForm.get('goals').setValue(updatedGoals);
    } else {
      const updatedGoals = [...currentGoals, goal];
      this.profileStepOneForm.get('goals').setValue(updatedGoals);
    }
  }

  onTagAdd(value: string) {
    if (!this.tags.includes(value)) {
      this.tags.push(value);
    }
  }

  onTagDelete(value: string) {
    this.tags = this.tags.filter((tag: string) => tag !== value);
  }

  submitStepOne() {
    const goals = this.profileStepOneForm.get('goals').value || [];
    const experienceLevel = this.profileStepOneForm.get('experience_level').value;
    const domain = this.profileStepOneForm.get('user_domain').value;

    this.userProfileManagerService.userProfileForm.patchValue({
      experience_level: experienceLevel,
      user_domain: domain,
    });
    this.userProfileManagerService.setUserGoals(goals);

    this.usersService.updateTags({ tags: this.tags }).subscribe(() => {
      this.authWatchService.updateSignedInUser();
      this.userProfileManagerService.updateUserDetails(false);
      this.router.navigate(['/user-profile-complete/step-two']);
    });
  }

  goToNextStep() {
    this.profileStepOneForm.markAllAsTouched();
    const goals = this.profileStepOneForm.get('goals').value || [];
    const experienceLevel = this.profileStepOneForm.get('experience_level').value;
    const domain = this.profileStepOneForm.get('user_domain').value;

    this.showGoalsError = false;
    this.showSkillsError = false;
    this.showExperienceLevelError = false;
    this.showDomainError = false;

    if (goals.length < 2) {
      this.showGoalsError = true;
    }

    if (this.tags.length === 0) {
      this.showSkillsError = true;
    }

    if (!experienceLevel) {
      this.showExperienceLevelError = true;
    }

    if (!domain) {
      this.showDomainError = true;
    }

    if (goals.length >= 2 && this.tags.length > 0 && experienceLevel && domain) {
      this.submitStepOne();
    }
  }
}
