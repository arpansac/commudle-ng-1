import { CheckRedirectGuard } from 'projects/shared-services/check-redirect.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'projects/shared-services/lib-authwatch.guard';
import { IndexComponent } from './components/index/index.component';
import { MainNewsletterFormComponent } from './components/main-newsletter-form/main-newsletter-form.component';
import { MainNewsletterComponent } from './components/main-newsletter/main-newsletter.component';


const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: IndexComponent
      },
      {
        path: 'new',
        component: MainNewsletterFormComponent,
        canDeactivate: [CheckRedirectGuard]
      },
      {
        path: ':main_newsletter_id',
        component: MainNewsletterComponent
      },
      {
        path: ':main_newsletter_id/edit',
        component: MainNewsletterFormComponent,
        canDeactivate: [CheckRedirectGuard]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainNewslettersRoutingModule { }
