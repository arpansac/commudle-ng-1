import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForumsRoutes } from './forums.routing';
import { ForumsDashboardComponent } from './components/forums-dashboard/forums-dashboard.component';
import { NbCardModule } from '@commudle/theme';

@NgModule({
  declarations: [ForumsDashboardComponent],
  imports: [
    CommonModule,
    ForumsRoutes,

    // Nebular
    NbCardModule,
  ],
})
export class ForumsModule {}
