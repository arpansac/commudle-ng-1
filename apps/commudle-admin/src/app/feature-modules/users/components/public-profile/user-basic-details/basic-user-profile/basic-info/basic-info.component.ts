import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserProfileManagerService } from 'apps/commudle-admin/src/app/feature-modules/users/services/user-profile-manager.service';
import { faFileImage } from '@fortawesome/free-solid-svg-icons';
import { GooglePlacesAutocompleteService } from 'apps/commudle-admin/src/app/services/google-places-autocomplete.service';
import { Subject, takeUntil } from 'rxjs';
import { IUser } from '@commudle/shared-models';
import { AuthService, ToastrService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.scss'],
})
export class BasicInfoComponent implements OnInit, OnDestroy {
  @ViewChild('autocompleteInput', { static: true })
  autocompleteInput: ElementRef;

  @Output() basicInfoFormValidity: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() userData: EventEmitter<IUser> = new EventEmitter<IUser>();

  currentUser: IUser;
  uploadedProfilePicture: any;
  uploadedProfilePictureFile: File;

  faFileImage = faFileImage;

  basicInfoForm;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authWatchService: AuthService,
    private toastLogService: ToastrService,
    private userProfileManagerService: UserProfileManagerService,
    private googlePlacesAutocompleteService: GooglePlacesAutocompleteService,
  ) {
    this.basicInfoForm = this.fb.group({
      name: ['', Validators.required],
      about_me: ['', [Validators.required, Validators.minLength(30), Validators.maxLength(2600)]],
      designation: ['', [Validators.required, Validators.maxLength(100)]],
      location: ['', [Validators.required]],
      gender: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.authWatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((currentUser) => {
      if (currentUser) {
        this.currentUser = currentUser;
        this.userProfileManagerService.patchFormValues(this.currentUser);
        this.basicInfoForm.patchValue(this.currentUser);
        this.basicInfoFormValidity.emit(this.basicInfoForm.valid); //initial validity
        this.userData.emit(this.currentUser); //initial validity
        this.uploadedProfilePicture = this.currentUser.avatar;
        this.userProfileManagerService.userProfileForm.patchValue(this.basicInfoForm.value);
      }
    });

    this.basicInfoForm.valueChanges.subscribe((value) => {
      this.userProfileManagerService.userProfileForm.patchValue(value);
      this.userData.emit(value);
      this.basicInfoFormValidity.emit(this.basicInfoForm.valid); // whenever form value changes check validity
    });

    this.initAutocomplete();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  displaySelectedProfileImage(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 2425190) {
        this.toastLogService.warningDialog('Image should be less than 2 Mb', 3000);
        return;
      }

      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heif', 'image/heic'];

      if (!allowedTypes.includes(file.type)) {
        this.toastLogService.warningDialog('Please upload a valid image file (PNG, JPG, JPEG, WebP, HEIF)');
        return;
      }
      this.uploadedProfilePictureFile = file;

      if (this.uploadedProfilePictureFile != null) {
        this.userProfileManagerService.uploadedProfilePictureFile = this.uploadedProfilePictureFile;
      }

      const reader = new FileReader();
      reader.onload = () => (this.uploadedProfilePicture = reader.result);
      reader.readAsDataURL(file);
    }
  }

  initAutocomplete() {
    this.googlePlacesAutocompleteService.initAutocomplete(this.autocompleteInput.nativeElement);
    this.googlePlacesAutocompleteService.placeChanged.subscribe((place: google.maps.places.PlaceResult) => {
      this.onLocationPlaceSelected(place);
    });
  }

  onLocationPlaceSelected(place: google.maps.places.PlaceResult) {
    this.basicInfoForm.patchValue({ location: place.formatted_address });
  }
}
