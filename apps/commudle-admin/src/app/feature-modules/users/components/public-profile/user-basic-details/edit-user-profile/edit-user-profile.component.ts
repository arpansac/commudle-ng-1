import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NbDialogRef, NbDialogService } from '@commudle/theme';
import { UpdateProfileService } from 'apps/commudle-admin/src/app/feature-modules/users/services/update-profile.service';
import { SeoService, AuthService } from '@commudle/shared-services';
import { IUser } from '@commudle/shared-models';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-edit-user-profile',
  templateUrl: './edit-user-profile.component.html',
  styleUrls: ['./edit-user-profile.component.scss'],
})
export class EditUserProfileComponent implements OnInit, OnDestroy {
  dialogRef: NbDialogRef<any>;
  currentUser: IUser;

  private destroy$ = new Subject<void>();

  @ViewChild('editProfile', { static: true }) editProfile: TemplateRef<any>;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: NbDialogService,
    private updateProfileService: UpdateProfileService,
    private seoService: SeoService,
    private authWatchService: AuthService,
  ) {}

  ngOnInit(): void {
    this.seoService.noIndex(true);
    this.openDialog();

    this.authWatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((currentUser) => {
      if (currentUser) {
        this.currentUser = currentUser;
      }
    });

    this.updateProfile();
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  openDialog() {
    this.dialogRef = this.dialogService.open(this.editProfile, { hasScroll: true });

    this.dialogRef.onClose.subscribe(() => {
      this.router.navigate([{ outlets: { p: null } }], { relativeTo: this.activatedRoute.parent });
    });
  }

  updateProfile() {
    this.updateProfileService.updateProfile$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      if (value) {
        this.dialogRef.close();
        this.updateProfileService.setUpdateProfileStatus(false);
      }
    });
  }
}
