import { Component, Input, OnInit } from '@angular/core';
import { IUser } from 'apps/shared-models/user.model';

@Component({
    selector: 'app-hiring-looking-works-tags',
    templateUrl: './hiring-looking-works-tags.component.html',
    styleUrls: ['./hiring-looking-works-tags.component.scss'],
    standalone: false
})
export class HiringLookingWorksTagsComponent implements OnInit {
  @Input() user: IUser;
  @Input() fontSize = '14px';
  /* Setting the default value of the size property to 'large' if the value is not passed in. */
  @Input() size: 'large' | 'medium' | 'small' = 'large';

  constructor() {}

  ngOnInit(): void {}
}
