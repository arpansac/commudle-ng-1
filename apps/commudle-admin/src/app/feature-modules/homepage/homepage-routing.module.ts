import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomepageComponent } from './components/homepage/homepage.component';
import { PageHackathonManagementPlatformComponent } from './components/custom-pages/page-hackathon-management-platform/page-hackathon-management-platform.component';
import { PagePaidTicketingComponent } from '../custom-public-pages/components/page-paid-ticketing/page-paid-ticketing.component';

const routes = [
  {
    path: '',
    component: HomepageComponent,
  },
  {
    path: 'hackathon-platform',
    component: PageHackathonManagementPlatformComponent,
  },
  {
    path: 'paid-ticketing',
    component: PagePaidTicketingComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomepageRoutingModule {}
