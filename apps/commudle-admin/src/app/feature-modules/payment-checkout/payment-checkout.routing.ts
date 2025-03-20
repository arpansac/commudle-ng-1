import { Routes, RouterModule } from '@angular/router';
import { CheckoutPageComponent } from './components/checkout-page/checkout-page.component';

const routes: Routes = [
  { path: ':purchase_order_uuid', component: CheckoutPageComponent },
  { path: ':purchase_order_uuid/complete', component: CheckoutPageComponent },
];

export const PaymentCheckoutRoutes = RouterModule.forChild(routes);
