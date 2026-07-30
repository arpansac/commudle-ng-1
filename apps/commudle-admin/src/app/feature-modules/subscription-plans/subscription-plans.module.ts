import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommudleCardModule } from '@commudle/commudle-theme';
import {
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbContextMenuModule,
  NbDialogModule,
  NbIconModule,
  NbInputModule,
  NbRouteTabsetModule,
  NbSelectModule,
  NbSpinnerModule,
} from '@commudle/theme';
import { MySubscriptionsComponent } from './components/my-subscriptions/my-subscriptions.component';
import { UserSubscriptionsComponent } from './components/user-subscriptions/user-subscriptions.component';
import { PaymentHistoryComponent } from './components/payment-history/payment-history.component';
import { SubscriptionPlansRoutingModule } from './subscription-plans-routing.module';
import { SharedPipesModule } from 'apps/shared-pipes/pipes.module';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';

@NgModule({
  declarations: [MySubscriptionsComponent, UserSubscriptionsComponent, PaymentHistoryComponent],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    SubscriptionPlansRoutingModule,
    FontAwesomeModule,
    CommudleCardModule,
    SharedPipesModule,
    SharedComponentsModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbSpinnerModule,
    NbInputModule,
    NbSelectModule,
    NbCheckboxModule,
    NbRouteTabsetModule,
    NbDialogModule,
    NbContextMenuModule,
  ],
})
export class SubscriptionPlansModule {}
