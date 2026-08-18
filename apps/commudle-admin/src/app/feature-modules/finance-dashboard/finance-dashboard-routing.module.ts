import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EUserRoles } from 'apps/shared-models/enums/user_roles.enum';
import { RoleGuard } from 'apps/shared-services/lib-role.guard';
import { FinanceDashboardComponent } from './components/finance-dashboard/finance-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: FinanceDashboardComponent,
    canActivate: [RoleGuard],
    // Access limited to Commudle's finance / accountant / CA role and system admins.
    data: {
      expectedRoles: [EUserRoles.FINANCE_ADMIN, EUserRoles.SYSTEM_ADMINISTRATOR],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinanceDashboardRoutingModule {}
