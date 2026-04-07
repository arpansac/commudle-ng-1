import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private fullHeightContent: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public fullHeightContent$ = this.fullHeightContent.asObservable();
  private showGlobalChatPopup: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public showGlobalChatPopup$ = this.showGlobalChatPopup.asObservable();

  changeFullHeightContent(value: boolean): void {
    this.fullHeightContent.next(value);
  }

  setShowGlobalChatPopup(value: boolean): void {
    this.showGlobalChatPopup.next(value);
  }
}
