import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminCampaignRoutes } from './admin-campaign.routing';
import { SharedComponentsModule as NewSharedComponentsModule } from '@commudle/shared-components';
import { CampaignFormComponent } from './components/campaign-form/campaign-form.component';
import { SidebarComponent } from 'apps/shared-components/sidebar/sidebar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NbButtonModule, NbCardModule } from '@commudle/theme';
import { CampaignFormSelectCampaignComponent } from './components/campaign-form/campaign-form-select-campaign/campaign-form-select-campaign.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CampaignDashboardComponent } from './components/campaign-dashboard/campaign-dashboard.component';
import { CampaignFormOrderSetupComponent } from './components/campaign-form/campaign-form-order-setup/campaign-form-order-setup.component';
import { CampaignFormOrderConfirmationComponent } from './components/campaign-form/campaign-form-order-confirmation/campaign-form-order-confirmation.component';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { SharedPipesModule } from 'apps/shared-pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    AdminCampaignRoutes,
    SharedComponentsModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    NewSharedComponentsModule,
    SharedPipesModule,

    //Standalone components
    SidebarComponent,

    //nebular
    NbCardModule,
    NbButtonModule,
  ],
  declarations: [
    CampaignFormComponent,
    CampaignFormSelectCampaignComponent,
    CampaignFormOrderSetupComponent,
    CampaignFormOrderConfirmationComponent,
    CampaignDashboardComponent,
  ],
})
export class AdminCampaignModule {}
