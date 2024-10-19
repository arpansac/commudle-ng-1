import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityFeedDirective } from './directive/activity-feed.directive';

@NgModule({
  declarations: [ActivityFeedDirective],
  imports: [CommonModule],
  exports: [ActivityFeedDirective],
})
export class ActivityFeedModule {}
