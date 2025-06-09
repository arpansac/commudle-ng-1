import { Component, OnInit } from '@angular/core';
import { AppUsersService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-profile-completion-progress',
  templateUrl: './profile-completion-progress.component.html',
  styleUrls: ['./profile-completion-progress.component.scss'],
})
export class ProfileCompletionProgressComponent implements OnInit {
  profileCompletionPercentage = 0;
  constructor(private appUsersService: AppUsersService) {}

  ngOnInit(): void {
    this.appUsersService.getCurrentUserProfileCompletionStatus().subscribe((res) => {
      this.profileCompletionPercentage = res.completion_percentage;
    });
  }
}
