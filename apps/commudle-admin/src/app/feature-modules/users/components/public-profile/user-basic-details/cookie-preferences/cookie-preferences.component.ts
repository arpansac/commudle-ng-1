import { Component, OnInit, OnDestroy } from '@angular/core';
import { SeoService } from '@commudle/shared-services';
import { LibAuthwatchService } from 'apps/shared-services/lib-authwatch.service';
import { ICurrentUser } from 'apps/shared-models/current_user.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'commudle-cookie-preferences',
  templateUrl: './cookie-preferences.component.html',
  styleUrls: ['./cookie-preferences.component.scss'],
})
export class CookiePreferencesComponent implements OnInit, OnDestroy {
  showPopup = false;
  currentUser: ICurrentUser;

  private destroy$ = new Subject<void>();

  constructor(private seoService: SeoService, private authWatchService: LibAuthwatchService) {}

  ngOnInit(): void {
    this.authWatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((data) => (this.currentUser = data));
    this.setMeta();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setMeta() {
    this.seoService.setTitle(`Cookie Preferences | Edit Profile | ${this.currentUser.name}`);
  }
}
