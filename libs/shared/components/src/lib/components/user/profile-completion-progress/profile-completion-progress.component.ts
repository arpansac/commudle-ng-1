import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppUsersService } from '@commudle/shared-services';
import { IProfileCompletionStatus } from '@commudle/shared-models';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'commudle-profile-completion-progress',
  templateUrl: './profile-completion-progress.component.html',
  styleUrls: ['./profile-completion-progress.component.scss'],
})
export class ProfileCompletionProgressComponent implements OnInit, OnDestroy {
  profileCompletionPercentage = 0;

  private destroy$ = new Subject<void>();

  constructor(private appUsersService: AppUsersService) {}

  ngOnInit(): void {
    this.appUsersService.profileCompletionStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe((status: IProfileCompletionStatus) => {
        if (status) {
          this.profileCompletionPercentage = status.completion_percentage;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
