import { Component, OnInit } from '@angular/core';
import { IProfileCompletionStatus } from '@commudle/shared-models';
import { AppUsersService } from '@commudle/shared-services';

interface MissingField {
  name: string;
  route: string;
  text: string;
  bold_text: string;
  button_text: string;
}

@Component({
  selector: 'commudle-user-profile-missing-fields',
  templateUrl: './user-profile-missing-fields.component.html',
  styleUrls: ['./user-profile-missing-fields.component.scss'],
})
export class UserProfileMissingFieldsComponent implements OnInit {
  userProfileMissingFields: string[] = [];
  missingFieldsData: MissingField[] = [];

  // Map field names to display names and routes
  private fieldMappings: { [key: string]: MissingField } = {
    avatar: {
      name: 'avatar',
      route: '/user-profile-complete/step-two',
      text: 'Make it Personal -',
      bold_text: 'Upload Your Profile Picture',
      button_text: 'Upload Now',
    },
    skills: {
      name: 'skills',
      route: '/user-profile-complete/step-one',
      text: 'Get Tailored Recommendations - ',
      bold_text: 'Add Skill Tags',
      button_text: 'Add Skills',
    },
    goals: {
      name: 'goals',
      route: '/user-profile-complete/step-one',
      text: 'Make it Personal -',
      bold_text: 'Add Goals',
      button_text: 'Add Goals',
    },
    experience_level: {
      name: 'experience_level',
      route: '/user-profile-complete/step-one',
      text: 'Make it Personal -',
      bold_text: 'Add Experience Level',
      button_text: 'Add Experience Level',
    },
    name: {
      name: 'name',
      route: '/user-profile-complete/step-two',
      text: 'Make it Personal -',
      bold_text: 'Add Your Name',
      button_text: 'Add Your Name',
    },
    designation: {
      name: 'designation',
      route: '/user-profile-complete/step-two',
      text: 'Make it Personal -',
      bold_text: 'Add Designation',
      button_text: 'Add Designation',
    },
    location: {
      name: 'location',
      route: '/user-profile-complete/step-two',
      text: 'Make it Personal -',
      bold_text: 'Add Your Location',
      button_text: 'Add Your Location',
    },
    about_me: {
      name: 'about_me',
      route: '/user-profile-complete/step-two',
      text: 'Make it Personal -',
      bold_text: 'Add Your Bio',
      button_text: 'Add Your Bio',
    },
    gender: {
      name: 'gender',
      route: '/user-profile-complete/step-two',
      text: 'Make it Personal -',
      bold_text: 'Add Gender',
      button_text: 'Add Gender',
    },
    username: {
      name: 'username',
      route: '/user-profile-complete/step-two',
      text: 'Make it Personal -',
      bold_text: 'Add Username',
      button_text: 'Add Username',
    },
    user_domain: {
      name: 'user_domain',
      route: 'user-profile-complete/step-one',
      text: 'Make it Personal -',
      bold_text: 'Add Your Domains',
      button_text: 'Add Your Domains',
    },
  };

  constructor(private appUsersService: AppUsersService) {}

  ngOnInit(): void {
    this.appUsersService.profileCompletionStatus$.subscribe((status: IProfileCompletionStatus) => {
      if (status) {
        this.userProfileMissingFields = status.missing_fields;
        this.mapMissingFields();
      }
    });
  }

  mapMissingFields(): void {
    this.missingFieldsData = this.userProfileMissingFields
      .filter((field) => this.fieldMappings[field])
      .map((field) => this.fieldMappings[field]);
  }
}
