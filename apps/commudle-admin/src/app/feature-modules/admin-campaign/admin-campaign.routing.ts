import { Routes, RouterModule } from '@angular/router';
import { CampaignFormComponent } from './components/campaign-form/campaign-form.component';
import { CampaignFormSelectCampaignComponent } from './components/campaign-form/campaign-form-select-campaign/campaign-form-select-campaign.component';
import { CampaignFormOrderSetupComponent } from './components/campaign-form/campaign-form-order-setup/campaign-form-order-setup.component';
import { CampaignFormOrderConfirmationComponent } from './components/campaign-form/campaign-form-order-confirmation/campaign-form-order-confirmation.component';

const routes: Routes = [
  {
    path: 'new',
    component: CampaignFormComponent,
    children: [
      { path: '', component: CampaignFormSelectCampaignComponent },
      {
        path: 'order-setup',
        component: CampaignFormOrderSetupComponent,
      },
      {
        path: 'order-confirmation',
        component: CampaignFormOrderConfirmationComponent,
      },
    ],
  },
  {
    path: 'edit/:campaign-id',
    component: CampaignFormComponent,
  },
];

export const AdminCampaignRoutes = RouterModule.forChild(routes);
