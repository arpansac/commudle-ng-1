import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbButtonModule } from '@commudle/theme';
import { MiniUserProfileModule } from 'apps/shared-modules/mini-user-profile/mini-user-profile.module';
import * as moment from 'moment';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { IFeaturedItems } from 'apps/shared-models/featured-items.model';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHeart, faMessage } from '@fortawesome/free-regular-svg-icons';
import { ILab } from '@commudle/shared-models';
import { CommudleCardModule } from '@commudle/commudle-theme';

@Component({
  selector: 'commudle-labs-featured-card',
  standalone: true,
  imports: [
    CommonModule,
    MiniUserProfileModule,
    SharedComponentsModule,
    NbButtonModule,
    RouterModule,
    FontAwesomeModule,
    CommudleCardModule,
  ],
  templateUrl: './labs-featured-card.component.html',
  styleUrls: ['./labs-featured-card.component.scss'],
})
export class LabsFeaturedCardComponent {
  @Input() lab: ILab;
  moment = moment;
  faMessage = faMessage;
  faHeart = faHeart;
}
