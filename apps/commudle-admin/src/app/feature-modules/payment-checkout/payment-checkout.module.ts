import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentCheckoutRoutes } from './payment-checkout.routing';
import { CheckoutPageComponent } from './components/checkout-page/checkout-page.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NbButtonModule, NbCardModule, NbInputModule } from '@commudle/theme';
import { SharedComponentsModule as NewSharedComponentModule } from '@commudle/shared-components';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { FormsModule } from '@angular/forms';
@NgModule({
  imports: [
    CommonModule,
    PaymentCheckoutRoutes,
    FontAwesomeModule,
    NewSharedComponentModule,
    SharedComponentsModule,
    FormsModule,

    // Theme modules
    NbCardModule,
    NbButtonModule,
    NbInputModule,
  ],
  declarations: [CheckoutPageComponent],
})
export class PaymentCheckoutModule {}
