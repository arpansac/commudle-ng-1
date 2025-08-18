import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForumsRoutes } from './forums.routing';
import { ForumsDashboardComponent } from './components/forums-dashboard/forums-dashboard.component';
import { NbButtonModule, NbCardModule, NbIconModule, NbInputModule } from '@commudle/theme';
import { ForumsCategoriesComponent } from './components/forums-categories/forums-categories.component';
import { ForumFormComponent } from './components/forum-form/forum-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [ForumsDashboardComponent, ForumsCategoriesComponent, ForumFormComponent],
  imports: [
    CommonModule,
    ForumsRoutes,
    ReactiveFormsModule,
    FontAwesomeModule,

    // Nebular
    NbCardModule,
    NbIconModule,
    NbButtonModule,
    NbInputModule,
  ],
})
export class ForumsModule {}
