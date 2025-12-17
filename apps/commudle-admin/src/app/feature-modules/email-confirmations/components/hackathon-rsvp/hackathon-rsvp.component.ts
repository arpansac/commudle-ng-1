import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  EHackathonRegistrationStatus,
  EOfflineInviteStatus,
  EUserRoles,
  IHackathonTeam,
  IProfileCompletionStatus,
  IUser,
  IUserStat,
} from '@commudle/shared-models';
import { AppUsersService, AuthService } from '@commudle/shared-services';
import { SeoService } from 'apps/shared-services/seo.service';
import { Subject, takeUntil } from 'rxjs';
import { IHackathon } from 'apps/shared-models/hackathon.model';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { UserRolesUsersService } from 'apps/commudle-admin/src/app/services/user_roles_users.service';

@Component({
  selector: 'commudle-hackathon-rsvp',
  templateUrl: './hackathon-rsvp.component.html',
  styleUrls: ['./hackathon-rsvp.component.scss'],
})
export class HackathonRsvpComponent implements OnInit, OnDestroy {
  token: string;
  rsvpStatus: number;
  isProfileCompleted = false;
  team: IHackathonTeam;
  hackathon: IHackathon;
  userProfileDetails: IUserStat;
  communityLeaders: IUser[];
  hackathonJudges = [];
  isLoadingCommunityLeaders = true;
  isLoadingJudges = true;
  isLoading = true;
  EOfflineInviteStatus = EOfflineInviteStatus;
  EHackathonRegistrationStatus = EHackathonRegistrationStatus;

  private destroy$ = new Subject<void>();
  currentUser: IUser;

  constructor(
    private activatedRoute: ActivatedRoute,
    private seoService: SeoService,
    private authService: AuthService,
    private appUsersService: AppUsersService,
    private hackathonService: HackathonService,
    private uruService: UserRolesUsersService,
  ) {}

  ngOnInit() {
    this.seoService.setTitle('Hackathon RSVP');
    this.seoService.noIndex(true);
    this.fetchCurrentUserDetails();

    this.activatedRoute.queryParams.subscribe((data) => {
      this.token = data['rsvp_token'];
      this.rsvpStatus = Number(data['rsvp_status']);
      this.fetchRSVP();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.seoService.noIndex(false);
  }

  private fetchRSVP() {
    if (this.rsvpStatus !== undefined && this.rsvpStatus !== null) {
      this.hackathonService.updateRsvpByToken(this.token, this.rsvpStatus).subscribe(
        (team: IHackathonTeam) => {
          this.team = team;
          this.isLoading = false;
          this.fetchHackathon();
        },
        (error) => {
          this.team = error.error.data;
          this.isLoading = false;
          this.fetchHackathon();
        },
      );
    }
  }

  private fetchHackathon() {
    this.hackathonService.pShowHackathon(this.team.hackathon_id).subscribe((data) => {
      this.hackathon = data;
      this.getJudges();
      this.fetchCommunityDetails();
      this.updateSEOTitle();
    });
  }

  private getJudges() {
    this.isLoadingJudges = true;
    this.hackathonService.pIndexJudge(this.hackathon.id).subscribe((data) => {
      this.hackathonJudges = data;
      this.isLoadingJudges = false;
    });
  }

  private fetchCurrentUserDetails() {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((currentUser: IUser) => {
      this.currentUser = currentUser;
      this.fetchUserStats();
      this.getProfileCompletionStatus();
    });
  }

  private fetchUserStats() {
    this.appUsersService.getProfileStats().subscribe((data) => {
      this.userProfileDetails = data;
    });
  }

  private getProfileCompletionStatus() {
    this.appUsersService.profileCompletionStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe((status: IProfileCompletionStatus) => {
        if (status) {
          this.isProfileCompleted = !status.completed;
        }
      });
  }

  private fetchCommunityDetails() {
    if (!this.hackathon?.community) return;
    this.isLoadingCommunityLeaders = true;
    this.uruService.pGetCommunityLeadersByRole(this.hackathon.community.id, EUserRoles.ORGANIZER).subscribe((data) => {
      this.communityLeaders = data.users;
      this.isLoadingCommunityLeaders = false;
    });
  }

  private updateSEOTitle() {
    if (this.hackathon && this.hackathon.community) {
      this.seoService.setTitle(`RSVP | ${this.hackathon.name} | ${this.hackathon.community.name}`);
    }
  }
}
