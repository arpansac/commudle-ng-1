import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile-complete-step-one',
  templateUrl: './user-profile-complete-step-one.component.html',
  styleUrls: ['./user-profile-complete-step-one.component.scss'],
})
export class UserProfileCompleteStepOneComponent {
  constructor(private router: Router) {}

  goToNextStep() {
    this.router.navigate(['/user-profile-complete/step-two']);
  }
}
