import { AfterViewInit, Directive, ElementRef, HostListener, Input, OnDestroy } from '@angular/core';
import { UserEngagementRecordsService } from '@commudle/shared-services';
import { EUserActivityEventType, EDbModels, IActivityFeed } from '@commudle/shared-models';

@Directive({
    selector: '[appActivityFeed]',
    standalone: false
})
export class ActivityFeedDirective implements AfterViewInit, OnDestroy {
  @Input() feed: IActivityFeed;
  EDbModels = EDbModels;

  timeout: any;
  private observer: IntersectionObserver;

  constructor(private el: ElementRef, private userEngagementRecordsService: UserEngagementRecordsService) {}

  ngAfterViewInit() {
    // TODO: change to use dedicated library
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.timeout = setTimeout(() => {
              this.getUserEngagement(EUserActivityEventType.IMPRESSION);
            }, 1000);
          }
        });
      },
      { threshold: 1 }, // how much % of the element is in view
    );
    this.observer.observe(this.el.nativeElement);
  }

  @HostListener('click')
  onClick() {
    this.getUserEngagement(EUserActivityEventType.CLICK);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  getUserEngagement(event_type: string) {
    const formData = new FormData();
    formData.append(
      'user_engagement_record[parent_id]',
      this.feed.actionable_type === EDbModels.VOTE ? this.feed.actionable.object_data?.id : this.feed.actionable?.id,
    );
    formData.append(
      'user_engagement_record[parent_type]',
      this.feed.actionable_type === EDbModels.VOTE ? this.feed.actionable.object_type : this.feed.actionable_type,
    );
    formData.append('user_engagement_record[url]', window.location.href);
    formData.append('user_engagement_record[event_type]', event_type);
    formData.append('user_engagement_record[created_at]', new Date().toISOString());
    this.userEngagementRecordsService.userEngagementRecords(formData).subscribe((data) => {});
  }
}
