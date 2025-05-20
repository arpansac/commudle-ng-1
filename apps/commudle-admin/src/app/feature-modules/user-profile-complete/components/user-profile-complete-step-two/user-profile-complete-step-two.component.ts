import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile-complete-step-two',
  templateUrl: './user-profile-complete-step-two.component.html',
  styleUrls: ['./user-profile-complete-step-two.component.scss'],
})
export class UserProfileCompleteStepTwoComponent {
  constructor(private router: Router) {}

  goToNextStep() {
    this.router.navigate(['/user-profile-complete/step-three']);
  }

  goToPreviousStep() {
    this.router.navigate(['/user-profile-complete/step-one']);
  }
}
