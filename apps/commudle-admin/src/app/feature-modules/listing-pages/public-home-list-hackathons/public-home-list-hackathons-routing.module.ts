import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicHomeListHackathonsHomeageComponent } from './components/public-home-list-hackathons-homeage.component';

const routes: Routes = [
  {
    path: '',
    component: PublicHomeListHackathonsHomeageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicHomeListHackathonsRoutingModule {}
