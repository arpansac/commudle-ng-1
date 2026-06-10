import { Component, Input } from '@angular/core';
import { IUser } from 'apps/shared-models/user.model';
import { faBriefcase, faUserGroup } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-hiring-looking-works-tags',
  templateUrl: './hiring-looking-works-tags.component.html',
  styleUrls: ['./hiring-looking-works-tags.component.scss'],
  standalone: false,
})
export class HiringLookingWorksTagsComponent {
  @Input() user: IUser;
  @Input() fontSize = '14px';
  @Input() size: 'large' | 'medium' | 'small' = 'large';

  faBriefcase = faBriefcase;
  faUserGroup = faUserGroup;
}
