import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private fullHeightContent: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public fullHeightContent$ = this.fullHeightContent.asObservable();

  changeFullHeightContent(value: boolean): void {
    this.fullHeightContent.next(value);
  }
}
