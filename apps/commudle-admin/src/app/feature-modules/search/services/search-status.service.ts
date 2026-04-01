import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchStatusService {
  searchStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  searchStatus$ = this.searchStatus.asObservable();
  private showNavbarSearchBox = new BehaviorSubject<boolean>(true);
  public showNavbarSearchBox$ = this.showNavbarSearchBox.asObservable();

  setSearchStatus(status: boolean) {
    this.searchStatus.next(status);
  }

  setShowNavbarSearchBox(value: boolean): void {
    this.showNavbarSearchBox.next(value);
  }
}
