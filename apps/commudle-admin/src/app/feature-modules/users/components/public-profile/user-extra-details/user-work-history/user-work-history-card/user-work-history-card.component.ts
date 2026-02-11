import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef } from '@angular/core';
import { NbDialogService, NbToastrService } from '@commudle/theme';
import { UserWorkHistoryService } from 'apps/commudle-admin/src/app/feature-modules/users/services/user-work-history.service';
import { ICurrentUser } from 'apps/shared-models/current_user.model';
import { IUser } from 'apps/shared-models/user.model';
import { IUserWorkHistory } from 'apps/shared-models/user_work_history.model';
import { LibAuthwatchService } from 'apps/shared-services/lib-authwatch.service';
import { Subject, Subscription, takeUntil } from 'rxjs';

@Component({
    selector: 'app-user-work-history-card',
    templateUrl: './user-work-history-card.component.html',
    styleUrls: ['./user-work-history-card.component.scss'],
    standalone: false
})
export class UserWorkHistoryCardComponent implements OnInit, OnDestroy {
  @Input() user: IUser;
  @Input() userWorkHistory: IUserWorkHistory;

  @Output() updateUserWorkHistory: EventEmitter<any> = new EventEmitter<any>();
  @Output() reloadUserWorkHistory: EventEmitter<any> = new EventEmitter<any>();

  currentUser: ICurrentUser;

  subscriptions: Subscription[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private authWatchService: LibAuthwatchService,
    private userWorkHistoryService: UserWorkHistoryService,
    private nbDialogService: NbDialogService,
    private nbToastrService: NbToastrService,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.authWatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((data) => (this.currentUser = data)),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
  }

  deleteUserWorkHistory() {
    this.subscriptions.push(
      this.userWorkHistoryService.deleteWorkHistory(this.userWorkHistory.id).subscribe((value) => {
        if (value) {
          this.nbToastrService.success('Work history deleted successfully', 'Success');
          this.reloadUserWorkHistory.emit();
        }
      }),
    );
  }

  onDialogOpen(templateRef: TemplateRef<any>) {
    this.nbDialogService.open(templateRef, { closeOnEsc: false, closeOnBackdropClick: false });
  }
}
