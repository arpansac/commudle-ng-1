import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbCardModule } from '@commudle/theme';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';
import { MiniUserProfileModule } from 'apps/shared-modules/mini-user-profile/mini-user-profile.module';
import { RouterModule } from '@angular/router';
import { IFeaturedItems } from 'apps/shared-models/featured-items.model';
import { UserPersonalConnectComponent } from 'apps/commudle-admin/src/app/app-shared-components/user-personal-connect/user-personal-connect.component';

@Component({
  selector: 'commudle-featured-experts-card',
  standalone: true,
  templateUrl: './featured-experts-card.component.html',
  styleUrls: ['./featured-experts-card.component.scss'],
  imports: [CommonModule, RouterModule, NbCardModule, MiniUserProfileModule, UserPersonalConnectComponent],
})
export class FeaturedExpertsCardComponent implements OnInit {
  @Input() expert: any;
  staticAssets = staticAssets;
  constructor() {}

  ngOnInit(): void {}
}
