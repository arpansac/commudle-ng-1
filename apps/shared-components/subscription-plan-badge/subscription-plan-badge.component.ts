import { Component, Input, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { IUserSubscription, EUserSubscriptionStatus } from '@commudle/shared-models';
import { UserSubscriptionService } from '@commudle/shared-services';
import { NbDialogService, NbDialogRef } from '@commudle/theme';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-subscription-plan-badge',
  templateUrl: './subscription-plan-badge.component.html',
  styleUrls: ['./subscription-plan-badge.component.scss'],
  standalone: false,
})
export class SubscriptionPlanBadgeComponent implements OnInit, OnDestroy {
  @Input() subscriptionId: number;
  @ViewChild('planDialog') planDialog: TemplateRef<any>;

  subscription: IUserSubscription | null = null;
  isLoading = true;
  EUserSubscriptionStatus = EUserSubscriptionStatus;

  private destroy$ = new Subject<void>();
  private dialogRef: NbDialogRef<any>;

  constructor(private userSubscriptionService: UserSubscriptionService, private dialogService: NbDialogService) {}

  ngOnInit(): void {
    if (this.subscriptionId) {
      this.userSubscriptionService
        .getSubscription(this.subscriptionId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (sub) => {
            this.subscription = sub;
            this.isLoading = false;
          },
          error: () => (this.isLoading = false),
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.dialogRef?.close();
  }

  openDialog(): void {
    if (!this.subscription) return;
    this.dialogRef = this.dialogService.open(this.planDialog, {
      closeOnBackdropClick: true,
    });
  }

  getDaysLeft(): number {
    if (!this.subscription?.ends_at) return 0;
    const diff = new Date(this.subscription.ends_at).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  getStatusClass(): string {
    const map: Record<string, string> = {
      active: 'status-active',
      expired: 'status-expired',
      cancelled: 'status-cancelled',
      payment_failed: 'status-failed',
      pending: 'status-pending',
    };
    return map[this.subscription?.status] || '';
  }
}
