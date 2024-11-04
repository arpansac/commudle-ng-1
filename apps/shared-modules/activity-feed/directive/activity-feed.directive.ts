import { AfterViewInit, Directive, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { UserEngagementRecordsService } from 'apps/shared-services/user-engagement-records.service';
import { IActivityFeed } from 'libs/shared/models/src/lib/activity-feed.model';
import { EDbModels } from '@commudle/shared-models';

@Directive({
  selector: '[appActivityFeed]',
})
export class ActivityFeedDirective {
  @Input() feed: IActivityFeed;
  EDbModels = EDbModels;

  timeout: any;
  private observer: IntersectionObserver;

  constructor(private el: ElementRef, private userEngagementRecordsService: UserEngagementRecordsService) {}

  ngOnInit() {
    console.log(this.feed);
  }

  ngAfterViewInit() {
    // TODO: change to use dedicated library
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log('view', this.feed);
            this.timeout = setTimeout(() => {
              this.getUserEngagement('user_view');
            }, 1000);
          }
        });
      },
      //   { threshold: 1 }, // how much % of the element is in view
    );
    this.observer.observe(this.el.nativeElement);
  }

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    this.getUserEngagement('user_click');
  }

  ngOnDestroy(): void {
    if (this.observer) {
      //   clearTimeout(this.timeout);
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
    this.userEngagementRecordsService.userEngagementRecords(formData).subscribe((data) => {
      // console.log(typeof formData.append('user_engagement_record[url]', window.location.href));
    });
  }
}

// formData.append('location[address]', this.locationForm.get('address').value);
