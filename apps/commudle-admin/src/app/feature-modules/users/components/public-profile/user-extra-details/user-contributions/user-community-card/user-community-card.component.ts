import { Component, Input, OnInit } from '@angular/core';
import { IUserRolesUser } from 'apps/shared-models/user_roles_user.model';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';

@Component({
  selector: 'app-user-community-card',
  templateUrl: './user-community-card.component.html',
  styleUrls: ['./user-community-card.component.scss'],
})
export class UserCommunityCardComponent implements OnInit {
  @Input() community: IUserRolesUser;
  staticAssets = staticAssets;

  constructor() {}

  ngOnInit(): void {}
}
