import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbButtonModule, NbCardModule } from '@commudle/theme';
import { UserProfileCompleteStepOneComponent } from 'apps/commudle-admin/src/app/feature-modules/user-profile-complete/components/user-profile-complete-step-one/user-profile-complete-step-one.component';
import { UserProfileCompleteStepTwoComponent } from 'apps/commudle-admin/src/app/feature-modules/user-profile-complete/components/user-profile-complete-step-two/user-profile-complete-step-two.component';
import { UserProfileCompleteStepThreeComponent } from 'apps/commudle-admin/src/app/feature-modules/user-profile-complete/components/user-profile-complete-step-three/user-profile-complete-step-three.component';
import { UserProfileCompleteRoutingModule } from 'apps/commudle-admin/src/app/feature-modules/user-profile-complete/user-profile-complete-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedPipesModule } from 'apps/shared-pipes/pipes.module';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { UsersModule } from 'apps/commudle-admin/src/app/feature-modules/users/users.module';

@NgModule({
  declarations: [
    UserProfileCompleteStepOneComponent,
    UserProfileCompleteStepTwoComponent,
    UserProfileCompleteStepThreeComponent,
  ],
  imports: [
    CommonModule,
    NbCardModule,
    NbButtonModule,
    UserProfileCompleteRoutingModule,
    FormsModule,
    SharedPipesModule,
    SharedComponentsModule,
    ReactiveFormsModule,
    UsersModule,
  ],
})
export class UserProfileCompleteModule {}
