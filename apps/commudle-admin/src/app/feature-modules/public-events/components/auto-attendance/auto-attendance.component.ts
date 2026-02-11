import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';
import { EventEntryPassesService } from 'apps/commudle-admin/src/app/services/event-entry-passes.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { LibAuthwatchService } from 'apps/shared-services/lib-authwatch.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-auto-attendance',
    templateUrl: './auto-attendance.component.html',
    styleUrls: ['./auto-attendance.component.scss'],
    standalone: false
})
export class AutoAttendanceComponent implements OnInit, OnDestroy {
  @Input() eventId;
  subscriptions = [];

  private destroy$ = new Subject<void>();

  constructor(
    private eventEntryPassesService: EventEntryPassesService,
    private toastLogService: LibToastLogService,
    private authWatchService: LibAuthwatchService,
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.authWatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
        if (data) {
          this.markAttendance();
        }
      }),
    );
  }

  ngOnDestroy() {
    for (const subs of this.subscriptions) {
      subs.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  markAttendance() {
    this.eventEntryPassesService.autoOnlineAttendance(this.eventId).subscribe((data) => {
      if (data) {
        this.toastLogService.successDialog('Welcome to the event!');
      }
    });
  }
}
