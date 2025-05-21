import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NbButtonModule } from '@commudle/theme';
import { ICurrentUser } from 'apps/shared-models/current_user.model';
import { LibAuthwatchService } from 'apps/shared-services/lib-authwatch.service';
import { Subject, takeUntil } from 'rxjs';
import { AppUsersService } from 'apps/commudle-admin/src/app/services/app-users.service';
import { EExperienceLevel } from '@commudle/shared-models';

@Component({
  selector: 'app-user-profile-complete-step-one',
  templateUrl: './user-profile-complete-step-one.component.html',
  styleUrls: ['./user-profile-complete-step-one.component.scss'],
})
export class UserProfileCompleteStepOneComponent implements OnInit {
  currentUser: ICurrentUser;
  goals = [];
  tags = [];

  selectedGoals: number[] = [];
  selectedSkills: string[] = [];
  suggestedSkills: string[] = ['JavaScript', 'Python', 'React', 'Angular', 'Node.js', 'AWS', 'Docker'];
  skillInput = '';
  selectedJourneyLevel = 0;
  EExperienceLevel = EExperienceLevel;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authWatchService: LibAuthwatchService,
    private appUsersService: AppUsersService,
  ) {}

  ngOnInit() {
    this.authWatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.currentUser = data;
      this.getGoals();
    });
  }

  getGoals() {
    this.appUsersService.getMyGoals().subscribe((data) => {
      this.goals = data;
      console.log(data);
    });
  }

  toggleGoal(goalId: number) {
    if (this.selectedGoals.includes(goalId)) {
      this.selectedGoals = this.selectedGoals.filter((goal) => goal !== goalId);
    } else {
      this.selectedGoals.push(goalId);
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
    this.router.navigate(['/user-profile-complete/step-two']);
  }
}
