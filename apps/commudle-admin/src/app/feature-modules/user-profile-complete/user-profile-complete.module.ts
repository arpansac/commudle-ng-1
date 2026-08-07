import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbButtonModule, NbCardModule, NbInputModule } from '@commudle/theme';
import { UserProfileCompleteStepOneComponent } from 'apps/commudle-admin/src/app/feature-modules/user-profile-complete/components/user-profile-complete-step-one/user-profile-complete-step-one.component';
import { UserProfileCompleteStepTwoComponent } from 'apps/commudle-admin/src/app/feature-modules/user-profile-complete/components/user-profile-complete-step-two/user-profile-complete-step-two.component';
import { UserProfileCompleteStepThreeComponent } from 'apps/commudle-admin/src/app/feature-modules/user-profile-complete/components/user-profile-complete-step-three/user-profile-complete-step-three.component';
import { UserProfileCompleteRoutingModule } from 'apps/commudle-admin/src/app/feature-modules/user-profile-complete/user-profile-complete-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedPipesModule } from 'apps/shared-pipes/pipes.module';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { UsersModule } from 'apps/commudle-admin/src/app/feature-modules/users/users.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommunitiesCardComponent } from 'apps/commudle-admin/src/app/app-shared-components/communities-card/communities-card.component';
import { MiniUserProfileModule } from 'apps/shared-modules/mini-user-profile/mini-user-profile.module';
import { EventMiniCardComponent } from 'apps/commudle-admin/src/app/app-shared-components/event-mini-card/event-mini-card.component';
import { FeaturedCommunitiesCardComponent } from 'apps/commudle-admin/src/app/app-shared-components/featured-communities-card/featured-communities-card.component';

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
    NbInputModule,
    UserProfileCompleteRoutingModule,
    FormsModule,
    SharedPipesModule,
    SharedComponentsModule,
    ReactiveFormsModule,
    UsersModule,
    FontAwesomeModule,
    CommunitiesCardComponent,
    MiniUserProfileModule,
    EventMiniCardComponent,
    FeaturedCommunitiesCardComponent,
  ],
})
export class UserProfileCompleteModule {}
