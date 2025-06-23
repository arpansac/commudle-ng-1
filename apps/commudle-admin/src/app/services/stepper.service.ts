import { Injectable, OnDestroy } from '@angular/core';
import { IUser } from '@commudle/shared-models';
import { AuthService } from '@commudle/shared-services';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StepperService implements OnDestroy {
  private profileWeights: Record<string, number> = {
    goals: 15,
    skills: 10,
    experience_level: 10,
    avatar: 10,
    name: 5,
    designation: 10,
    location: 5,
    about_me: 10,
    gender: 5,
    username: 10,
    user_domain: 10,
  };

  private profileCompletePercentage = new BehaviorSubject<number>(0);
  public profileCompletePercentage$ = this.profileCompletePercentage.asObservable();

  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService) {}

  getProfilePercentage(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.calculateProfilePercentage(user);
    });
  }

  calculateProfilePercentage(user: IUser): void {
    let profilePercentage = 0;

    // Check tags for skills
    if (user.tags?.length >= 1) {
      profilePercentage += this.profileWeights.skills;
    }

    // Check all other fields
    for (const [field, weight] of Object.entries(this.profileWeights)) {
      if (field !== 'skills' && user[field]) {
        profilePercentage += weight;
      }
    }
    this.profileCompletePercentage.next(profilePercentage);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
