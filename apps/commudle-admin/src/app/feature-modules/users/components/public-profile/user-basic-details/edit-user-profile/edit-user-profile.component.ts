import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NbDialogRef, NbDialogService } from '@commudle/theme';
import { UpdateProfileService } from 'apps/commudle-admin/src/app/feature-modules/users/services/update-profile.service';
import { ICurrentUser } from 'apps/shared-models/current_user.model';
import { SeoService } from 'apps/shared-services/seo.service';
import { LibAuthwatchService } from 'apps/shared-services/lib-authwatch.service';
import { Subscription, Subject, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-edit-user-profile',
  templateUrl: './edit-user-profile.component.html',
  styleUrls: ['./edit-user-profile.component.scss'],
})
export class EditUserProfileComponent implements OnInit, OnDestroy {
  dialogRef: NbDialogRef<any>;
  subscriptions: Subscription[] = [];
  currentUser: ICurrentUser;
  routerSubscription: Subscription;
  username: string;
  routeTitleMap = {
    'basic-details': 'Basic Details',
    'email-preferences': 'Email Preferences',
    'communication-preferences': 'Communication Preferences',
    'cookie-preferences': 'Cookie Preferences',
    'account-management': 'Account Management',
  };

  private destroy$ = new Subject<void>();

  @ViewChild('editProfile', { static: true }) editProfile: TemplateRef<any>;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: NbDialogService,
    private updateProfileService: UpdateProfileService,
    private seoService: SeoService,
    private authWatchService: LibAuthwatchService,
  ) {}

  ngOnInit(): void {
    this.username = this.activatedRoute.parent?.snapshot.params['username'] || '';

    this.authWatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((currentUser) => {
      if (currentUser) {
        this.currentUser = currentUser;
      }
    });

    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setMeta();
      });
    this.setMeta();
    this.openDialog();
    this.seoService.noIndex(true);
    this.updateProfile();
  }

  ngOnDestroy(): void {
    this.dialogRef.close();
    this.seoService.noIndex(false);
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  openDialog() {
    this.dialogRef = this.dialogService.open(this.editProfile, { hasScroll: true });

    this.dialogRef.onClose.subscribe(() => {
      this.router.navigate([{ outlets: { p: null } }], { relativeTo: this.activatedRoute.parent });
    });
  }

  updateProfile() {
    this.subscriptions.push(
      this.updateProfileService.updateProfile$.subscribe((value) => {
        if (value) {
          this.dialogRef.close();
          this.updateProfileService.setUpdateProfileStatus(false);
        }
      }),
    );
  }

  setMeta() {
    const currentRoute = this.activatedRoute.firstChild;

    if (currentRoute) {
      const routePath = currentRoute.snapshot.url[0]?.path;
      const tabName = this.routeTitleMap[routePath] || 'Settings';
      const displayName = this.currentUser?.name || this.username;
      const title = `${tabName} | Edit Profile | ${displayName}`;
      this.seoService.setTitle(title);
    }
  }
}
