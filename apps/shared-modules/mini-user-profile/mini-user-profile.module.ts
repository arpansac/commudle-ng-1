import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NbButtonModule, NbCardModule, NbIconModule, NbTagModule } from '@commudle/theme';
import { SharedPipesModule } from 'apps/shared-pipes/pipes.module';
import { MiniUserProfileComponent } from './components/mini-user-profile/mini-user-profile.component';
import { UserProfileCardLargeComponent } from './components/profile-cards/user-profile-card-large/user-profile-card-large.component';
import { UserProfileCardMediumComponent } from './components/profile-cards/user-profile-card-medium/user-profile-card-medium.component';
import { UserProfileCardSmallComponent } from './components/profile-cards/user-profile-card-small/user-profile-card-small.component';
import { UserFollowComponent } from './components/user-follow/user-follow.component';
import { MiniUserProfileDirective } from './directives/mini-user-profile.directive';
import { HiringLookingWorksTagsComponent } from './components/hiring-looking-works-tags/hiring-looking-works-tags.component';
import { BadgeComponent } from '../../shared-components/badge/badge.component';
import { UserPersonalConnectComponent } from 'libs/shared/components/src/lib/components/user-personal-connect/user-personal-connect.component';
import { UserExpertTickComponent } from 'apps/commudle-admin/src/app/app-shared-components/user-expert-tick.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    MiniUserProfileDirective,
    MiniUserProfileComponent,
    UserProfileCardSmallComponent,
    UserProfileCardMediumComponent,
    UserProfileCardLargeComponent,
    UserFollowComponent,
    HiringLookingWorksTagsComponent,
  ],
  imports: [
    CommonModule,
    SharedPipesModule,
    RouterModule,
    BadgeComponent,
    //Nebular
    NbCardModule,
    NbTagModule,
    NbIconModule,
    NbButtonModule,
    UserPersonalConnectComponent,
    UserExpertTickComponent,
    FontAwesomeModule,
  ],

  exports: [
    MiniUserProfileDirective,
    UserProfileCardSmallComponent,
    UserProfileCardMediumComponent,
    UserProfileCardLargeComponent,
    UserFollowComponent,
    HiringLookingWorksTagsComponent,
  ],
})
export class MiniUserProfileModule {}
