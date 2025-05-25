import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FooterService {
  private footerStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public footerStatus$ = this.footerStatus.asObservable();

  private miniFooterStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public miniFooterStatus$ = this.miniFooterStatus.asObservable();

  changeFooterStatus(value: boolean): void {
    this.footerStatus.next(value);
  }

  changeMiniFooterStatus(value: boolean): void {
    this.miniFooterStatus.next(value);
  }
}
