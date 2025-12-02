import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Error404PageComponent } from 'apps/lib-error-handler/src/public-api';
import { PageCommudleVsCompetitorComponent } from './components/page-commudle-vs-competitor/page-commudle-vs-competitor.component';
import { PageUniversityPlanComponent } from './components/page-university-plan/page-university-plan.component';
import { PagePaidTicketingComponent } from './components/page-paid-ticketing/page-paid-ticketing.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/404',
  },
  {
    path: 'commudle-vs-competitor',
    component: PageCommudleVsCompetitorComponent,
  },
  {
    path: 'university-plan',
    component: PageUniversityPlanComponent,
  },
  {
    path: 'paid-ticketing',
    component: PagePaidTicketingComponent,
  },
  {
    path: '**',
    component: Error404PageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomPublicPagesRoutingModule {}
