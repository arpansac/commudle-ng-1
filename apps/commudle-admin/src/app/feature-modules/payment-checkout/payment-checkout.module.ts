import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentCheckoutRoutes } from './payment-checkout.routing';
import { CheckoutPageComponent } from './components/checkout-page/checkout-page.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NbCardModule } from '@commudle/theme';
import { SharedComponentsModule as NewSharedComponentModule } from '@commudle/shared-components';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
@NgModule({
  imports: [
    CommonModule,
    PaymentCheckoutRoutes,
    FontAwesomeModule,
    NbCardModule,
    NewSharedComponentModule,
    SharedComponentsModule,
  ],
  declarations: [CheckoutPageComponent],
})
export class PaymentCheckoutModule {}
