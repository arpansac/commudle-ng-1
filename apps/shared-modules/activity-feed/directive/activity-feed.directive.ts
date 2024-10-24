import { AfterViewInit, Directive, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { UserEngagementRecordsService } from 'apps/shared-services/user-engagement-records.service';
import { IActivityFeed } from 'libs/shared/models/src/lib/activity-feed.model';

@Directive({
  selector: '[appActivityFeed]',
})
export class ActivityFeedDirective {
  @Input() feed: IActivityFeed;

  timeout: any;
  private observer: IntersectionObserver;

  constructor(private el: ElementRef, private userEngagementRecordsService: UserEngagementRecordsService) {}

  ngAfterViewInit() {
    // TODO: change to use dedicated library
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log(this.feed.actionable_type);
            // this.timeout = setTimeout(() => {
            // }, 5000);
          }
        });
      },
      //   { threshold: 1 }, // how much % of the element is in view
    );
    this.observer.observe(this.el.nativeElement);
  }

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    console.log('Clicked:', this.feed.actionable_type);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      //   clearTimeout(this.timeout);
      this.observer.disconnect();
    }
  }

  getUserEngagement() {
    // this.userEngagementRecordsService.userEngagementRecords().subscribe((data) => {
    //   console.log(data);
    // });
  }
}
