import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserProfileCompleteStepOneComponent } from 'apps/commudle-admin/src/app/feature-modules/user-profile-complete/components/user-profile-complete-step-one/user-profile-complete-step-one.component';
import { UserProfileCompleteStepThreeComponent } from 'apps/commudle-admin/src/app/feature-modules/user-profile-complete/components/user-profile-complete-step-three/user-profile-complete-step-three.component';
import { UserProfileCompleteStepTwoComponent } from 'apps/commudle-admin/src/app/feature-modules/user-profile-complete/components/user-profile-complete-step-two/user-profile-complete-step-two.component';

const routes: Routes = [
  {
    path: 'step-one',
    component: UserProfileCompleteStepOneComponent,
  },
  {
    path: 'step-two',
    component: UserProfileCompleteStepTwoComponent,
  },
  {
    path: 'step-three',
    component: UserProfileCompleteStepThreeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserProfileCompleteRoutingModule {}
