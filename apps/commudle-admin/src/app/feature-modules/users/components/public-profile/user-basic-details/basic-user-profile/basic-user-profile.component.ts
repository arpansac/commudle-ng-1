import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UserProfileManagerService } from 'apps/commudle-admin/src/app/feature-modules/users/services/user-profile-manager.service';
import { ICurrentUser } from 'apps/shared-models/current_user.model';
import { LibAuthwatchService } from 'apps/shared-services/lib-authwatch.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-basic-user-profile',
  templateUrl: './basic-user-profile.component.html',
  styleUrls: ['./basic-user-profile.component.scss'],
})
export class BasicUserProfileComponent implements OnInit, OnDestroy {
  @Input() pagePadding = true;
  currentUser: ICurrentUser;

  private destroy$ = new Subject<void>();

  constructor(
    private authWatchService: LibAuthwatchService,
    public userProfileManagerService: UserProfileManagerService,
  ) {}

  ngOnInit() {
    this.authWatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((currentUser) => {
      if (currentUser) {
        this.currentUser = currentUser;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateUserDetails() {
    this.userProfileManagerService.updateUserDetails(true, this.currentUser);
  }
}
