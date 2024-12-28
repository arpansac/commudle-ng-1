import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { UserVisitsService } from '../../shared-services/user-visits.service';
import { LibAuthwatchService } from 'apps/shared-services/lib-authwatch.service';
import { ICurrentUser } from 'apps/shared-models/current_user.model';
import { Router, NavigationEnd, Event } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-user-visit-tracker',
  templateUrl: './user-visit-tracker.component.html',
  styleUrls: ['./user-visit-tracker.component.scss'],
})
export class UserVisitTrackerComponent implements OnInit, OnDestroy {
  currentUser: ICurrentUser;
  currentRoute;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private location: Location,
    private userVisitsService: UserVisitsService,
    private authWatchService: LibAuthwatchService,
  ) {}

  ngOnInit() {
    this.currentRoute = this.router.url;

    this.userVisits();
    this.userVisitsService.receiveData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  userVisits() {
    // create a visit if the route changes
    this.router.events.subscribe((val) => {
      if (this.location.path() !== this.currentRoute) {
        this.sendLog();
      }
    });

    // create a visit if the user changes
    this.authWatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.sendLog();
    });
  }

  sendLog() {
    this.currentRoute = this.location.path();
    this.userVisitsService.subscribe(this.currentRoute);
  }
}
