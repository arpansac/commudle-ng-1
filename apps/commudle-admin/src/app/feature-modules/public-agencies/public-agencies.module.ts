import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedComponentsModule } from '@commudle/shared-components';
import { NbButtonModule, NbInputModule, NbTooltipModule } from '@commudle/theme';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppSharedComponentsModule } from 'apps/commudle-admin/src/app/app-shared-components/app-shared-components.module';
import { FeaturesModule } from 'apps/commudle-admin/src/app/feature-modules/features/features.module';
import { BadgeComponent } from 'apps/shared-components/badge/badge.component';
import { SharedPipesModule } from 'apps/shared-pipes/pipes.module';
import { AgenciesComponent } from './components/agencies/agencies.component';
import { PublicPagesRoutingModule } from './public-agencies-routing.module';

@NgModule({
  declarations: [AgenciesComponent],
  imports: [
    CommonModule,
    PublicPagesRoutingModule,
    AppSharedComponentsModule,
    NbButtonModule,
    SharedComponentsModule,
    BadgeComponent,
    FeaturesModule,
    SharedPipesModule,

    //Nebular
    NbInputModule,
    NbButtonModule,
    NbTooltipModule,

    //FontAwesome
    FontAwesomeModule,
  ],
})
export class PublicAgenciesModule {}
