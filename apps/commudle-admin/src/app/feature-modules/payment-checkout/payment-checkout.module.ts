import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentCheckoutRoutes } from './payment-checkout.routing';
import { CheckoutPageComponent } from './components/checkout-page/checkout-page.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NbButtonModule, NbCardModule, NbInputModule } from '@commudle/theme';
import { SharedComponentsModule as NewSharedComponentModule } from '@commudle/shared-components';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    PaymentCheckoutRoutes,
    FontAwesomeModule,
    NbCardModule,
    NewSharedComponentModule,
    SharedComponentsModule,
    NbButtonModule,
    ReactiveFormsModule,
    NbInputModule,
  ],
  declarations: [CheckoutPageComponent],
})
export class PaymentCheckoutModule {}
