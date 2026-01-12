import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DarkModeService {
  private isDarkMode = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.isDarkMode.asObservable();

  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  toggleDarkMode(isDarkMode: boolean): void {
    this.isDarkMode.next(isDarkMode);

    if (!this.isBrowser) {
      return;
    }

    try {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    } catch {
      // ignore storage failures
    }

    try {
      document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    } catch {
      // ignore DOM failures
    }
  }
}
