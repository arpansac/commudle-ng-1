import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicProfileComponent } from './components/public-profile/public-profile.component';
import { BasicUserProfileComponent } from './components/public-profile/user-basic-details/basic-user-profile/basic-user-profile.component';
import { EditUserProfileComponent } from './components/public-profile/user-basic-details/edit-user-profile/edit-user-profile.component';
import { EmailPreferencesComponent } from './components/public-profile/user-basic-details/email-preferences/email-preferences.component';
import { UserExtraDetailsComponent } from './components/public-profile/user-extra-details/user-extra-details.component';
import { UserResumePreviewComponent } from './components/public-profile/user-extra-details/user-resume/user-resume-preview/user-resume-preview.component';
import { UserNetworkListComponent } from './components/public-profile/user-network/user-network-list/user-network-list.component';
import { UserNetworkComponent } from './components/public-profile/user-network/user-network.component';
import { CommunicationPreferencesComponent } from './components/public-profile/user-basic-details/communication-preferences/communication-preferences.component';
import { CookiePreferencesComponent } from './components/public-profile/user-basic-details/cookie-preferences/cookie-preferences.component';
import { AccountManagementComponent } from './components/public-profile/user-basic-details/account-management/account-management.component';
import { Recap2025Component } from './components/recap-2025/recap-2025.component';
import { UserProfileCompleteStepOneComponent } from 'apps/commudle-admin/src/app/feature-modules/user-profile-complete/components/user-profile-complete-step-one/user-profile-complete-step-one.component';

const routes: Routes = [
  {
    path: ':username/recap-2025',
    component: Recap2025Component,
  },
  {
    path: ':username',
    component: PublicProfileComponent,
    children: [
      {
        path: 'settings',
        outlet: 'p',
        component: EditUserProfileComponent,
        children: [
          {
            path: 'goals-and-skills',
            component: UserProfileCompleteStepOneComponent,
          },
          {
            path: 'basic-details',
            component: BasicUserProfileComponent,
          },
          {
            path: 'email-preferences',
            component: EmailPreferencesComponent,
          },
          {
            path: 'communication-preferences',
            component: CommunicationPreferencesComponent,
          },
          {
            path: 'cookie-preferences',
            component: CookiePreferencesComponent,
          },
          {
            path: 'account-management',
            component: AccountManagementComponent,
          },
        ],
      },
      {
        path: 'resume/:uuid',
        outlet: 'p',
        component: UserResumePreviewComponent,
      },
      {
        path: '',
        component: UserExtraDetailsComponent,
      },
      {
        path: '',
        component: UserNetworkComponent,
        children: [
          {
            path: 'followers',
            component: UserNetworkListComponent,
          },
          {
            path: 'following',
            component: UserNetworkListComponent,
          },
        ],
      },

      { path: '**', redirectTo: '' },
    ],
  },
  { path: '', redirectTo: '/', pathMatch: 'prefix' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
