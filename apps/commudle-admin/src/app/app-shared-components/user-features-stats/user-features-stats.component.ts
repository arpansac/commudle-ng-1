import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faEye,
  faMicrophone,
  faFlask,
  faLightbulb,
  faCalendarCheck,
  faBookmark,
} from '@fortawesome/free-solid-svg-icons';
import { IUser, IUserStat } from '@commudle/shared-models';
import { AppUsersService } from 'apps/commudle-admin/src/app/services/app-users.service';
import { SharedDirectivesModule } from 'apps/shared-directives/shared-directives.module';
import { Subscription } from 'rxjs';
import { StatItem } from './user-features-stats.model';

@Component({
  selector: 'commudle-user-features-stats',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, SharedDirectivesModule],
  templateUrl: './user-features-stats.component.html',
  styleUrls: ['./user-features-stats.component.scss'],
})
export class UserFeaturesStatsComponent implements OnChanges, OnDestroy {
  @Input() user: IUser;

  stats: StatItem[] = [];

  private subscriptions: Subscription[] = [];

  constructor(private appUsersService: AppUsersService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.user && changes.user.currentValue) {
      this.fetchProfileStats();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  private fetchProfileStats(): void {
    this.subscriptions.push(
      this.appUsersService.getProfileStats().subscribe((data: IUserStat) => {
        this.buildStats(data);
      }),
    );
  }

  private buildStats(data: IUserStat): void {
    this.stats = [
      {
        icon: faEye,
        label: 'Profile Visits (90 Days)',
        count: data.profile_views?.overall?.ninety_days || 0,
        colorClass: 'icon-purple',
      },
      {
        icon: faMicrophone,
        label: 'Talks Given',
        count: data.speaker_events_count || 0,
        colorClass: 'icon-red',
      },
      {
        icon: faFlask,
        label: 'Labs Published',
        count: data.published_labs_count || 0,
        colorClass: 'icon-teal',
      },
      {
        icon: faLightbulb,
        label: 'Builds Published',
        count: data.published_community_builds_count || 0,
        colorClass: 'icon-amber',
      },
      {
        icon: faCalendarCheck,
        label: 'Attended Events',
        count: data.events_attended_count || 0,
        colorClass: 'icon-green',
      },
      {
        icon: faBookmark,
        label: 'Content Shared',
        count: data.social_resources_count || 0,
        colorClass: 'icon-blue',
      },
    ];
  }
}
