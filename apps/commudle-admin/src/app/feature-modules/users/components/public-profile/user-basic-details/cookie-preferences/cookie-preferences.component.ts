import { Component, OnInit, OnDestroy } from '@angular/core';
import { SeoService, AuthService } from '@commudle/shared-services';
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

  constructor(private seoService: SeoService, private authWatchService: AuthService) {}

  ngOnInit(): void {
    this.authWatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((data) => (this.currentUser = data));
    // this.setMeta();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setMeta() {
    this.seoService.setTitle(`Cookie Preferences | Edit Profile | ${this.currentUser.name}`);
  }
}
