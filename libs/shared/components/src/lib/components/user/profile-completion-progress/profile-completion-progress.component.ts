import { Component, OnInit } from '@angular/core';
import { AppUsersService } from '@commudle/shared-services';
import { IProfileCompletionStatus } from '@commudle/shared-models';

@Component({
  selector: 'commudle-profile-completion-progress',
  templateUrl: './profile-completion-progress.component.html',
  styleUrls: ['./profile-completion-progress.component.scss'],
})
export class ProfileCompletionProgressComponent implements OnInit {
  profileCompletionPercentage = 0;

  constructor(private appUsersService: AppUsersService) {}

  ngOnInit(): void {
    this.appUsersService.profileCompletionStatus$.subscribe((status: IProfileCompletionStatus) => {
      if (status) {
        this.profileCompletionPercentage = status.completion_percentage;
      }
    });
  }
}
