import { Component, Input } from '@angular/core';
import { IDataFormEntityResponseGroup } from 'apps/shared-models/data_form_entity_response_group.model';

@Component({
  selector: 'app-user-engagement-data',
  templateUrl: './user-engagement-data.component.html',
  styleUrls: ['./user-engagement-data.component.scss'],
})
export class UserEngagementDataComponent {
  @Input() userResponse: IDataFormEntityResponseGroup;
  @Input() communityId: number;
}
