import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileStatusBarService {
  private profileBarStatus: Subject<boolean> = new Subject<boolean>();
  public profileBarStatus$ = this.profileBarStatus.asObservable();
  private referrerUrlSubject$ = new BehaviorSubject<string | null>(null);
  public referrerUrl$ = this.referrerUrlSubject$.asObservable();

  changeProfileBarStatus(value: boolean) {
    this.profileBarStatus.next(value);
  }

  setReferrerUrl(url: string) {
    this.referrerUrlSubject$.next(url);
  }

  getReferrerUrl(): string | null {
    return this.referrerUrlSubject$.getValue();
  }

  clearReferrerUrl() {
    this.referrerUrlSubject$.next(null);
  }
}
