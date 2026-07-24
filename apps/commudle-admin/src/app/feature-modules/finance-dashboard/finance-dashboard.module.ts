import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NbButtonModule,
  NbCardModule,
  NbDialogModule,
  NbIconModule,
  NbInputModule,
  NbSpinnerModule,
  NbTooltipModule,
} from '@commudle/theme';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommudleCardModule } from '@commudle/commudle-theme';
import { SharedPipesModule } from 'apps/shared-pipes/pipes.module';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { FinanceDashboardComponent } from './components/finance-dashboard/finance-dashboard.component';
import { FinanceDashboardRoutingModule } from './finance-dashboard-routing.module';

@NgModule({
  declarations: [FinanceDashboardComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    CommudleCardModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbInputModule,
    NbSpinnerModule,
    NbTooltipModule,
    NbDialogModule.forChild(),
    SharedPipesModule,
    SharedComponentsModule,
    FinanceDashboardRoutingModule,
  ],
})
export class FinanceDashboardModule {}
