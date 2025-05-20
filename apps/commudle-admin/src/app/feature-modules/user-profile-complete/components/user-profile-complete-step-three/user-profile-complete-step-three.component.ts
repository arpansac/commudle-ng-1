import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile-complete-step-three',
  templateUrl: './user-profile-complete-step-three.component.html',
  styleUrls: ['./user-profile-complete-step-three.component.scss'],
})
export class UserProfileCompleteStepThreeComponent {
  constructor(private router: Router) {}

  finishProcess() {
    this.router.navigate(['/dashboard']);
  }

  goToPreviousStep() {
    this.router.navigate(['/user-profile-complete/step-two']);
  }
}
