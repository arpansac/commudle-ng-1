import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule } from '@angular/router';
import {
  faEye,
  faMicrophone,
  faFlask,
  faLightbulb,
  faCalendarCheck,
  faBookmark,
  faTrophy,
  faUsers,
  faGavel,
  faHandshake,
  faArrowUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import { IUser, IUserStat } from '@commudle/shared-models';
import { AppUsersService } from 'apps/commudle-admin/src/app/services/app-users.service';
import { AuthService } from '@commudle/shared-services';
import { SkeletonCardsComponent } from 'apps/commudle-admin/src/app/feature-modules/skeleton-screens/components/skeleton-cards/skeleton-cards.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'commudle-user-features-stats',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, SkeletonCardsComponent, RouterModule],
  templateUrl: './user-features-stats.component.html',
  styleUrls: ['./user-features-stats.component.scss'],
})
export class UserFeaturesStatsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() user: IUser;

  currentUser: IUser;
  userProfileDetails: IUserStat;
  isLoading = true;
  profileViews;

  faEye = faEye;
  faMicrophone = faMicrophone;
  faFlask = faFlask;
  faLightbulb = faLightbulb;
  faCalendarCheck = faCalendarCheck;
  faBookmark = faBookmark;
  faTrophy = faTrophy;
  faUsers = faUsers;
  faGavel = faGavel;
  faHandshake = faHandshake;
  faArrowUpRightFromSquare = faArrowUpRightFromSquare;

  private subscriptions: Subscription[] = [];

  constructor(private appUsersService: AppUsersService, private authService: AuthService) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.authService.currentUser$.subscribe((data) => {
        this.currentUser = data;
        if (this.currentUser && this.currentUser.id === this.user?.id) {
          this.fetchOwnProfileViews();
        }
      }),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.user && changes.user.currentValue) {
      this.fetchProfileStats();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  private fetchProfileStats(): void {
    this.isLoading = true;
    this.subscriptions.push(
      this.appUsersService.getPublicProfileStats(this.user.username).subscribe((data: IUserStat) => {
        this.userProfileDetails = data;
        this.isLoading = false;
      }),
    );
  }

  private fetchOwnProfileViews(): void {
    this.subscriptions.push(
      this.appUsersService.getProfileStats().subscribe((data: IUserStat) => {
        this.profileViews = data.profile_views;
      }),
    );
  }
}
