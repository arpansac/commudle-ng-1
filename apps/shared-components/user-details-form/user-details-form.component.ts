import { KeyValue } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EDomain, EExperienceLevel, IHackathonUserResponse, IUser } from '@commudle/shared-models';
import { faFileImage } from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, ToastrService } from '@commudle/shared-services';
@Component({
  selector: 'commudle-user-details-form',
  templateUrl: './user-details-form.component.html',
  styleUrls: ['./user-details-form.component.scss'],
})
export class UserDetailsFormComponent implements OnInit, OnDestroy {
  @Input() userFormDetails;
  @Input() showActionButtons = true;
  @Input() hackathonUserResponse: IHackathonUserResponse;
  @Input() submitButtonText = 'Next';
  @Output() submitUserDetailsEvent = new EventEmitter<any>();

  currentUser: IUser;
  userForm: FormGroup;
  uploadedProfilePictureFile: File;
  uploadedProfilePicture: any;
  faFileImage = faFileImage;
  EExperienceLevel = EExperienceLevel;
  EDomain = EDomain;
  private destroy$ = new Subject<void>();

  constructor(private authWatchService: AuthService, private fb: FormBuilder, private toastLogService: ToastrService) {}

  ngOnInit(): void {
    this.authWatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.currentUser = data;
      this.uploadedProfilePicture = this.currentUser.avatar;
      this.userForm = this.createForm(this.userFormDetails);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createForm(userDetails: any): FormGroup {
    const formGroupConfig: any = {};
    const urlPattern = /^(https?:\/\/)?([\w\d-]+\.)+[\w\d]{2,}(\/.*)?$/;

    // Dynamically add form controls based on configuration
    Object.keys(userDetails).forEach((key) => {
      if (userDetails[key] && key !== 'profile_image') {
        let userValues = this.currentUser[key];
        if (key === 'work_experience_months') {
          userValues = userValues / 12;
        }

        let validators = [Validators.required];

        // Add URL validation for social media fields
        if (
          key === 'github' ||
          key === 'gitlab' ||
          key === 'linkedin' ||
          key === 'medium' ||
          key === 'twitter' ||
          key === 'youtube' ||
          key === 'behance' ||
          key === 'dribbble' ||
          key === 'instagram' ||
          key === 'facebook'
        ) {
          validators.push(Validators.pattern(urlPattern));
        }
        if (this.hackathonUserResponse) {
          formGroupConfig[key] = [
            this.hackathonUserResponse && this.hackathonUserResponse[key]
              ? this.hackathonUserResponse[key]
              : userValues,
            validators,
          ];
        } else {
          formGroupConfig[key] = [userValues, validators];
        }
      }
    });

    return this.fb.group(formGroupConfig);
  }

  submitUserDetails() {
    if (this.userForm.invalid) {
      this.toastLogService.errorDialog('Please complete the profile fields');
      this.userForm.markAllAsTouched();
      return;
    }
    this.submitUserDetailsEvent.emit(this.userForm.value);
  }

  displaySelectedProfileImage(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 2425190) {
        this.toastLogService.warningDialog('Image should be less than 2 Mb', 3000);
        return;
      }
      this.uploadedProfilePictureFile = file;

      const reader = new FileReader();
      reader.onload = () => (this.uploadedProfilePicture = reader.result);
      reader.readAsDataURL(file);
    }
  }

  originalOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return 0;
  };
}
