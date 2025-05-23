import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NbButtonModule, NbToastrService } from '@commudle/theme';
import { ICurrentUser } from 'apps/shared-models/current_user.model';
import { LibAuthwatchService } from 'apps/shared-services/lib-authwatch.service';
import { Subject, takeUntil } from 'rxjs';
import { AppUsersService } from 'apps/commudle-admin/src/app/services/app-users.service';
import { EExperienceLevel } from '@commudle/shared-models';
import { UserProfileManagerService } from 'apps/commudle-admin/src/app/feature-modules/users/services/user-profile-manager.service';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';

@Component({
  selector: 'app-user-profile-complete-step-one',
  templateUrl: './user-profile-complete-step-one.component.html',
  styleUrls: ['./user-profile-complete-step-one.component.scss'],
})
export class UserProfileCompleteStepOneComponent implements OnInit {
  currentUser: ICurrentUser;
  goals = [];
  tags = [];
  EExperienceLevel = EExperienceLevel;
  showGoalsError = false;
  showSkillsError = false;
  showExperienceLevelError = false;
  profileStepOneForm;
  staticAssets = staticAssets;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authWatchService: LibAuthwatchService,
    private appUsersService: AppUsersService,
    private usersService: AppUsersService,
    private userProfileManagerService: UserProfileManagerService,
    private fb: FormBuilder,
  ) {
    this.profileStepOneForm = this.fb.group({
      experience_level: ['', Validators.required],
      domain: ['', Validators.required],
      goals: [[]],
    });
  }

  ngOnInit() {
    this.authWatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data) {
        this.currentUser = data;

        this.profileStepOneForm.patchValue({
          experience_level: data.experience_level || '',
          domain: data.domain || '',
          goals: data.goals || [],
        });

        // Set tags from user data
        this.tags = [];
        if (data.tags && data.tags.length > 0) {
          data.tags.forEach((tag) => {
            if (tag.name) {
              this.tags.push(tag.name);
            }
          });
        }

        // Get goals list
        this.getGoals();
      }
    });
  }

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
    const domain = this.profileStepOneForm.get('domain').value;

    this.userProfileManagerService.userProfileForm.patchValue({
      experience_level: experienceLevel,
      domain: domain,
    });
    this.userProfileManagerService.setUserGoals(goals);

    this.usersService.updateTags({ tags: this.tags }).subscribe(() => {
      this.authWatchService.updateSignedInUser();
      this.userProfileManagerService.updateUserDetails(false);
      this.router.navigate(['/user-profile-complete/step-two']);
    });
  }

  // submitStepOne() {
  //   this.usersService.updateTags({ tags: this.tags }).subscribe(() => {
  //     this.authWatchService.updateSignedInUser();
  //     this.gtm.dataLayerPushEvent('complete_your_profile_step_one', {
  //       com_skills: this.tagsDialog.toString(),
  //     });
  //   });
  //   //update username
  //   this.userProfileManagerService.setUpdateUsername(true);
  // }

  // addSkill() {
  //   if (this.skillInput.trim() !== '' && !this.selectedSkills.includes(this.skillInput.trim())) {
  //     this.selectedSkills.push(this.skillInput.trim());
  //     this.skillInput = '';
  //   }
  // }

  // removeSkill(index: number) {
  //   this.selectedSkills.splice(index, 1);
  // }

  // addSuggestedSkill(skill: string) {
  //   if (!this.selectedSkills.includes(skill)) {
  //     this.selectedSkills.push(skill);
  //   }
  // }

  goToNextStep() {
    const goals = this.profileStepOneForm.get('goals').value || [];
    const experienceLevel = this.profileStepOneForm.get('experience_level').value;

    // Validate form
    if (goals.length < 4) {
      this.showGoalsError = true;
      return;
    }

    if (this.tags.length === 0) {
      this.showSkillsError = true;
      return;
    }

    if (!experienceLevel) {
      this.showExperienceLevelError = true;
      return;
    }

    this.submitStepOne();
  }

  // submitStepOne() {
  //   // Get the updated user tags
  //   this.tags = this.tagsDialog;
  //   // When the save button is clicked, update the tags
  //   this.usersService.updateTags({ tags: this.tags }).subscribe(() => {
  //     this.authWatchService.updateSignedInUser();
  //     this.gtm.dataLayerPushEvent('complete_your_profile_step_one', {
  //       com_skills: this.tagsDialog.toString(),
  //     });
  //   });
  //   //update username
  //   this.userProfileManagerService.setUpdateUsername(true);
  // }

  // gtmServiceData(userData) {
  //   this.currentUser = userData;
  // }

  // submitStepTwo() {
  //   this.userProfileManagerService.updateUserDetails(false);
  //   if (this.currentUser) {
  //     this.gtm.dataLayerPushEvent('complete_your_profile_step_two', {
  //       com_name: this.currentUser.name,
  //       com_tagline: this.currentUser.designation,
  //       com_gender: this.currentUser.gender,
  //     });
  //   }
  // }

  // submitStepThree() {
  //   this.userProfileManagerService.updateUserDetails(false);
  //   this.gtm.dataLayerPushEvent('complete_your_profile_step_three', {
  //     com_profile_completed: true,
  //   });
  //   confetti.create(this.canvas, { resize: true })({
  //     shapes: ['square', 'circle', 'star'],
  //     particleCount: 1000,
  //     spread: 360,
  //     zIndex: 9999,
  //     disableForReducedMotion: true,
  //     ticks: 500,
  //   });
  // }

  // checkUsername(validUsername) {
  //   this.validUsername = validUsername;
  // }
}
