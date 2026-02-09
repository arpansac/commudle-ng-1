import { Routes, RouterModule } from '@angular/router';
// import { CampaignFormComponent } from './components/campaign-form/campaign-form.component';
// import { CampaignFormSelectCampaignComponent } from './components/campaign-form/campaign-form-select-campaign/campaign-form-select-campaign.component';
import { CampaignFormOrderSetupComponent } from './components/campaign-form/campaign-form-order-setup/campaign-form-order-setup.component';
// import { CampaignFormOrderConfirmationComponent } from './components/campaign-form/campaign-form-order-confirmation/campaign-form-order-confirmation.component';
// import { CampaignResolver } from './resolver/campaign.resolver';
import { CampaignDashboardComponent } from './components/campaign-dashboard/campaign-dashboard.component';
import { AdminCampaignStatsComponent } from 'apps/commudle-admin/src/app/feature-modules/admin-campaign/components/admin-campaign-stats/admin-campaign-stats.component';

const routes: Routes = [
  { path: '', component: CampaignDashboardComponent },
  {
    path: 'new',
    component: CampaignFormOrderSetupComponent,
  },
  {
    path: 'edit/:campaign_id',
    // resolve: {
    //   campaign: CampaignResolver,
    // },
    runGuardsAndResolvers: 'always',
    children: [{ path: '', component: CampaignFormOrderSetupComponent }],
  },
  {
    path: 'stats/:campaign_id',
    component: AdminCampaignStatsComponent,
  },
];

export const AdminCampaignRoutes = RouterModule.forChild(routes);
