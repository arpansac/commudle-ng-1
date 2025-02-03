import { Routes, RouterModule } from '@angular/router';
import { CampaignFormComponent } from './components/campaign-form/campaign-form.component';

const routes: Routes = [
  {
    path: 'new',
    component: CampaignFormComponent,
  },
  {
    path: 'edit/:campaign-id',
    component: CampaignFormComponent,
  },
];

export const AdminCampaignRoutes = RouterModule.forChild(routes);
