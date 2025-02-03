import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminCampaignRoutes } from './admin-campaign.routing';
import { SharedComponentsModule } from '@commudle/shared-components';
import { CampaignFormComponent } from './components/campaign-form/campaign-form.component';
import { SidebarComponent } from 'apps/shared-components/sidebar/sidebar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NbButtonModule, NbCardModule } from '@commudle/theme';
import { CampaignFormSelectCampaignComponent } from './components/campaign-form/campaign-form-select-campaign/campaign-form-select-campaign.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    AdminCampaignRoutes,
    SharedComponentsModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,

    //Standalone components
    SidebarComponent,

    //nebular
    NbCardModule,
    NbButtonModule,
  ],
  declarations: [CampaignFormComponent, CampaignFormSelectCampaignComponent],
})
export class AdminCampaignModule {}
