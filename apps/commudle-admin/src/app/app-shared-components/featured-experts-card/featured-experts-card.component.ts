import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbCardModule } from '@commudle/theme';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';
import { MiniUserProfileModule } from 'apps/shared-modules/mini-user-profile/mini-user-profile.module';
import { RouterModule } from '@angular/router';
import { UserPersonalConnectComponent } from 'libs/shared/components/src/lib/components/user-personal-connect/user-personal-connect.component';
import { UserExpertTickComponent } from 'apps/commudle-admin/src/app/app-shared-components/user-expert-tick.component';
import { IUser } from 'apps/shared-models/user.model';
import { faBriefcase } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'commudle-featured-experts-card',
  standalone: true,
  templateUrl: './featured-experts-card.component.html',
  styleUrls: ['./featured-experts-card.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    NbCardModule,
    MiniUserProfileModule,
    UserPersonalConnectComponent,
    UserExpertTickComponent,
    FontAwesomeModule,
  ],
})
export class FeaturedExpertsCardComponent implements OnInit {
  @Input() expert: IUser;
  staticAssets = staticAssets;
  faBriefcase = faBriefcase;

  constructor() {}

  ngOnInit(): void {}
}
