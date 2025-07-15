import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '@commudle/shared-services';
import { IUser } from '@commudle/shared-models';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'commudle-cookie-preferences',
  templateUrl: './cookie-preferences.component.html',
  styleUrls: ['./cookie-preferences.component.scss'],
})
export class CookiePreferencesComponent implements OnInit, OnDestroy {
  showPopup = false;
  currentUser: IUser;

  private destroy$ = new Subject<void>();

  constructor(private authWatchService: AuthService) {}

  ngOnInit(): void {
    this.authWatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((data) => (this.currentUser = data));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
