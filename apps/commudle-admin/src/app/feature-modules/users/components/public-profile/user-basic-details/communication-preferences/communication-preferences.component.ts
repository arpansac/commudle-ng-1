import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserProfileManagerService } from 'apps/commudle-admin/src/app/feature-modules/users/services/user-profile-manager.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NbDialogService, NbDialogRef } from '@commudle/theme';
import { LoginConsentPopupComponent } from 'apps/commudle-admin/src/app/components/login-consent-popup/login-consent-popup.component';
import { SeoService } from '@commudle/shared-services';
import { LibAuthwatchService } from 'apps/shared-services/lib-authwatch.service';
import { ICurrentUser } from 'apps/shared-models/current_user.model';

@Component({
  selector: 'commudle-communication-preferences',
  templateUrl: './communication-preferences.component.html',
  styleUrls: ['./communication-preferences.component.scss'],
})
export class CommunicationPreferencesComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  showPopup = false;

  subscriptions: Subscription[] = [];
  consent_privacy_tnc = false;
  consent_marketing = false;

  currentUser: ICurrentUser;

  constructor(
    private userProfileManagerService: UserProfileManagerService,
    private fb: FormBuilder,
    private dialogService: NbDialogService,
    private seoService: SeoService,
    private authWatchService: LibAuthwatchService,
  ) {
    this.loginForm = this.fb.group({
      consent_privacy_tnc: [''],
      consent_marketing: [''],
    });
  }

  ngOnInit(): void {
    this.subscriptions.push(this.authWatchService.currentUser$.subscribe((data) => (this.currentUser = data)));
    this.setMeta();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((value) => value.unsubscribe());
  }

  setMeta() {
    this.seoService.setTitle(`Communication Preferences | Edit Profile | ${this.currentUser.name}`);
  }

  updateCommunicationPreferences(): void {
    this.subscriptions.push(
      this.userProfileManagerService.updateCommunicationPreferences(this.loginForm.value).subscribe(),
    );
  }

  submit() {
    const dialogRef = this.dialogService.open(LoginConsentPopupComponent, {
      hasBackdrop: true,
      closeOnBackdropClick: false,
    });
    dialogRef.componentRef.instance.consentValueChangedOutput.subscribe((consent: any) => {
      this.consent_privacy_tnc = consent.consent_privacy_tnc;
      this.consent_marketing = consent.consent_marketing;
      this.loginForm.controls['consent_privacy_tnc'].setValue(consent.consent_privacy_tnc);
      this.loginForm.controls['consent_marketing'].setValue(consent.consent_marketing);
      this.updateCommunicationPreferences();

      dialogRef.close();
    });
  }
}
