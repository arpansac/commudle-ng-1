import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { LibAuthwatchService } from 'apps/shared-services/lib-authwatch.service';
import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';
import { UpdateProfileService } from 'apps/commudle-admin/src/app/feature-modules/users/services/update-profile.service';
import { AppUsersService } from 'apps/commudle-admin/src/app/services/app-users.service';
import { HttpClient } from '@angular/common/http';
import { ApiRoutesService } from 'apps/shared-services/api-routes.service';
import { Observable } from 'rxjs';
import { API_ROUTES } from 'apps/shared-services/api-routes.constants';
import { IUser } from 'apps/shared-models/user.model';
import { GoogleTagManagerService } from '@commudle/shared-services';

@Injectable({
  providedIn: 'root',
})
export class UserProfileManagerService {
  private updateUsername: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public updateUsername$ = this.updateUsername.asObservable();

  private user: BehaviorSubject<IUser> = new BehaviorSubject<IUser>(null);
  public user$ = this.user.asObservable();

  userProfileForm;
  userGoals: string[] = [];

  uploadedProfilePictureFile: File;

  constructor(
    private fb: FormBuilder,
    private usersService: AppUsersService,
    private toastLogService: LibToastLogService,
    private updateProfileService: UpdateProfileService,
    private authWatchService: LibAuthwatchService,
    private http: HttpClient,
    private apiRoutesService: ApiRoutesService,
    private gtm: GoogleTagManagerService,
  ) {
    this.userProfileForm = this.fb.group({
      name: ['', Validators.required],
      about_me: ['', [Validators.required, Validators.minLength(30), Validators.maxLength(2600)]],
      designation: ['', [Validators.required, Validators.maxLength(300)]],
      experience_level: [''],
      user_domain: [''],
      location: [''],
      gender: [''],
      personal_website: [''],
      github: [''],
      linkedin: [''],
      dribbble: [''],
      behance: [''],
      medium: [''],
      gitlab: [''],
      facebook: [''],
      youtube: [''],
      phone: [''],
      instagram: [''],
    });
  }

  setUpdateUsername(value: boolean) {
    this.updateUsername.next(value);
  }

  setUserGoals(goals: string[]) {
    this.userGoals = goals;
  }

  updateUserDetails(showToast: boolean, currentUser?: IUser) {
    const formData: any = new FormData();
    this.userProfileForm.patchValue({
      about_me: this.userProfileForm.get('about_me').value
        ? this.userProfileForm.get('about_me').value.replace(/[\n]+/g, '\n').trim()
        : '',
    });
    const userFormData = this.userProfileForm.value;
    Object.keys(userFormData).forEach((key) =>
      !(userFormData[key] == null) ? formData.append(`user[${key}]`, userFormData[key]) : '',
    );

    if (this.userGoals && this.userGoals.length > 0) {
      this.userGoals.forEach((goal) => {
        formData.append(`user[goals][]`, goal);
      });
    }

    if (this.uploadedProfilePictureFile != null) {
      formData.append('user[profile_image]', this.uploadedProfilePictureFile);
    }

    this.usersService.updateUserProfile(formData).subscribe((data) => {
      if (currentUser && currentUser.profile_completed === false && data.profile_completed === true) {
        this.gtm.dataLayerPushEvent('profile-completed', {});
      } else {
        this.gtm.dataLayerPushEvent('profile-updated', {});
      }
      this.authWatchService.updateSignedInUser();
      if (showToast) {
        this.toastLogService.successDialog(`Your Profile is now updated!`);
      }
      this.updateProfileService.setUpdateProfileStatus(true);
    });
  }

  toggleEmployee(): Observable<any> {
    return this.http.post<any>(this.apiRoutesService.getRoute(API_ROUTES.USERS.TOGGLE_EMPLOYEE_ROLE), {});
  }
  toggleEmployer(): Observable<any> {
    return this.http.post<any>(this.apiRoutesService.getRoute(API_ROUTES.USERS.TOGGLE_EMPLOYER_ROLE), {});
  }

  updateCommunicationPreferences(formData): Observable<any> {
    return this.http.post<any>(
      this.apiRoutesService.getRoute(API_ROUTES.USERS.UPDATE_COMMUNICATION_PREFERENCES),
      formData,
    );
  }

  getProfile(username) {
    this.usersService.getProfile(username).subscribe((data) => {
      this.user.next(data);
    });
  }

  patchFormValues(currentUser: IUser) {
    this.userProfileForm.patchValue({
      name: currentUser.name,
      about_me: currentUser.about_me,
      designation: currentUser.designation,
      experience_level: currentUser.experience_level,
      user_domain: currentUser.user_domain,
      location: currentUser.location,
      gender: currentUser.gender,
      personal_website: currentUser.personal_website,
      github: currentUser.github,
      linkedin: currentUser.linkedin,
      dribbble: currentUser.dribbble,
      behance: currentUser.behance,
      medium: currentUser.medium,
      gitlab: currentUser.gitlab,
      facebook: currentUser.facebook,
      youtube: currentUser.youtube,
      phone: currentUser.phone,
      instagram: currentUser.instagram,
    });
  }
}
