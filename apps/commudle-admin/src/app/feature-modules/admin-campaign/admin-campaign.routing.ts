import { Routes, RouterModule } from '@angular/router';
import { CampaignFormOrderSetupComponent } from './components/campaign-form/campaign-form-order-setup/campaign-form-order-setup.component';
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
    runGuardsAndResolvers: 'always',
    children: [{ path: '', component: CampaignFormOrderSetupComponent }],
  },
  {
    path: 'stats/:campaign_id',
    component: AdminCampaignStatsComponent,
  },
];

export const AdminCampaignRoutes = RouterModule.forChild(routes);
