import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MySubscriptionsComponent } from './components/my-subscriptions/my-subscriptions.component';
import { UserSubscriptionsComponent } from './components/user-subscriptions/user-subscriptions.component';
import { PaymentHistoryComponent } from './components/payment-history/payment-history.component';

const routes: Routes = [
  {
    path: '',
    component: MySubscriptionsComponent,
    children: [
      { path: '', component: UserSubscriptionsComponent },
      { path: 'payment-history', component: PaymentHistoryComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubscriptionPlansRoutingModule {}
