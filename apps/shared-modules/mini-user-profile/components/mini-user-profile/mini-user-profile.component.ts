import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { UserChatsService } from 'apps/commudle-admin/src/app/feature-modules/user-chats/services/user-chats.service';
import { AppUsersService } from 'apps/commudle-admin/src/app/services/app-users.service';
import { IMiniUserProfile } from 'apps/shared-models/mini-user-profile.model';
import { IUser, IUserStat } from '@commudle/shared-models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mini-user-profile',
  templateUrl: './mini-user-profile.component.html',
  styleUrls: ['./mini-user-profile.component.scss'],
  standalone: false,
})
export class MiniUserProfileComponent implements OnInit, OnDestroy {
  @Input() username: string;
  @Input() miniUser: IMiniUserProfile;
  @Output() popupHover = new EventEmitter();
  @Output() closeMiniProfile = new EventEmitter();

  user: IUser;
  userStats: IUserStat;
  activityChips: { label: string; type: string }[] = [];

  subscriptions: Subscription[] = [];

  constructor(
    private userChatsService: UserChatsService,
    private appUsersService: AppUsersService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.appUsersService.getProfile(this.username).subscribe((response) => {
        this.user = response;
        this.changeDetectorRef.markForCheck();
      }),
    );

    this.subscriptions.push(
      this.appUsersService.getPublicProfileStats(this.username).subscribe((data: IUserStat) => {
        this.userStats = data;
        this.buildActivityChips();
        this.changeDetectorRef.markForCheck();
      }),
    );

    // on route change, close the mini profile
    this.subscriptions.push(
      this.router.events.subscribe(() => {
        this.closeMiniProfile.emit(true);
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((value) => value.unsubscribe());
    this.popupHover.emit(false);
  }

  openChatWithUser(): void {
    this.userChatsService.changeFollowerId(this.miniUser.id);
  }

  onMouseOver() {
    this.popupHover.emit(true);
  }

  onMouseLeave() {
    this.popupHover.emit(false);
  }

  closePopup() {
    this.closeMiniProfile.emit(true);
  }

  private buildActivityChips(): void {
    const chips: { label: string; type: string }[] = [];

    if (this.userStats.hackathon_won_count > 0) {
      chips.push({ label: 'Hackathon Winner', type: 'stat' });
    }
    if (this.userStats.community_leader_count > 0) {
      chips.push({
        label: `Organizer of ${this.userStats.community_leader_count} communit${
          this.userStats.community_leader_count > 1 ? 'ies' : 'y'
        }`,
        type: 'stat',
      });
    }
    if (this.userStats.hackathon_mentor_count > 0) {
      chips.push({
        label: `Mentored ${this.userStats.hackathon_mentor_count} hackathon${
          this.userStats.hackathon_mentor_count > 1 ? 's' : ''
        }`,
        type: 'stat',
      });
    }
    if (this.userStats.hackathon_judge_count > 0) {
      chips.push({
        label: `Judged ${this.userStats.hackathon_judge_count} hackathon${
          this.userStats.hackathon_judge_count > 1 ? 's' : ''
        }`,
        type: 'stat',
      });
    }
    if (this.userStats.speaker_events_count > 0) {
      chips.push({
        label: `${this.userStats.speaker_events_count} Talk${this.userStats.speaker_events_count > 1 ? 's' : ''}`,
        type: 'stat',
      });
    }
    if (this.userStats.published_community_builds_count > 0) {
      chips.push({
        label: `${this.userStats.published_community_builds_count} Build${
          this.userStats.published_community_builds_count > 1 ? 's' : ''
        }`,
        type: 'stat',
      });
    }
    if (this.miniUser.followers_count > 0) {
      chips.push({ label: `${this.miniUser.followers_count} Followers`, type: 'stat' });
    }
    if (this.miniUser.communities_count > 0) {
      chips.push({ label: `${this.miniUser.communities_count} Communities`, type: 'stat' });
    }

    this.activityChips = chips.slice(0, 5);
  }
}
