import { Component, OnDestroy, OnInit } from '@angular/core';
import { IProfileCompletionStatus } from '@commudle/shared-models';
import { AppUsersService } from '@commudle/shared-services';
import { Subject, takeUntil } from 'rxjs';

interface MissingField {
  name: string;
  route: string;
  text: string;
  button_text: string;
}

@Component({
  selector: 'commudle-user-profile-missing-fields',
  templateUrl: './user-profile-missing-fields.component.html',
  styleUrls: ['./user-profile-missing-fields.component.scss'],
})
export class UserProfileMissingFieldsComponent implements OnInit, OnDestroy {
  userProfileMissingFields: string[] = [];
  missingFieldsData: MissingField[] = [];

  // Map field names to display names and routes
  private readonly fieldMappings: { [key: string]: MissingField } = {
    avatar: {
      name: 'avatar',
      route: '/user-profile-complete/step-two',
      text: 'Smile Please!',
      button_text: 'Upload Now',
    },
    skills: {
      name: 'skills',
      route: '/user-profile-complete/step-one',
      text: 'Skills can get you more opportunities',
      button_text: 'Add Skills',
    },
    goals: {
      name: 'goals',
      route: '/user-profile-complete/step-one',
      text: 'Communities can help you achieve a lot',
      button_text: 'Add Goals',
    },
    experience_level: {
      name: 'experience_level',
      route: '/user-profile-complete/step-one',
      text: 'Connect with similar experience folks',
      button_text: 'Add Experience Level',
    },
    name: {
      name: 'name',
      route: '/user-profile-complete/step-two',
      text: 'Your name is the the most important',
      button_text: 'Add Your Name',
    },
    designation: {
      name: 'designation',
      route: '/user-profile-complete/step-two',
      text: 'Any tagline for you? Probably your designation?',
      button_text: 'Add Designation',
    },
    location: {
      name: 'location',
      route: '/user-profile-complete/step-two',
      text: 'Get discovered & connect with local communities',
      button_text: 'Add Your Location',
    },
    about_me: {
      name: 'about_me',
      route: '/user-profile-complete/step-two',
      text: 'Your ‘Tell me something about yourself’',
      button_text: 'Add Your Bio',
    },
    gender: {
      name: 'gender',
      route: '/user-profile-complete/step-two',
      text: 'Communities love diversity',
      button_text: 'Add Gender',
    },
    username: {
      name: 'username',
      route: '/user-profile-complete/step-two',
      text: 'Reserve your unique username',
      button_text: 'Add Username',
    },
    user_domain: {
      name: 'user_domain',
      route: '/user-profile-complete/step-one',
      text: 'Which field are you into?',
      button_text: 'Add Your Domains',
    },
  };

  private destroy$ = new Subject<void>();

  constructor(private appUsersService: AppUsersService) {}

  ngOnInit(): void {
    this.appUsersService.profileCompletionStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe((status: IProfileCompletionStatus) => {
        if (status) {
          this.userProfileMissingFields = status.missing_fields;
          this.mapMissingFields();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  mapMissingFields(): void {
    this.missingFieldsData = this.userProfileMissingFields
      .filter((field) => this.fieldMappings[field])
      .map((field) => this.fieldMappings[field]);
  }
}
