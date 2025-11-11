import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';

@Component({
  selector: 'commudle-user-expert-tick',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-expert-tick.component.html',
  styleUrls: ['./user-expert-tick.component.scss'],
})
export class UserExpertTickComponent {
  staticAssets = staticAssets;
  @Input() size = '16px';
}
