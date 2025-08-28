import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForumsRoutes } from './forums.routing';
import { ForumsDashboardComponent } from './components/forums-dashboard/forums-dashboard.component';
import { NbButtonModule, NbCardModule, NbIconModule, NbInputModule } from '@commudle/theme';
import { ForumsCategoriesComponent } from './components/forums-categories/forums-categories.component';
import { ForumFormComponent } from './components/forum-form/forum-form.component';
import { ForumsByCategoryComponent } from './components/forums-by-category/forums-by-category.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SidebarComponent } from 'apps/shared-components/sidebar/sidebar.component';

@NgModule({
  declarations: [ForumsDashboardComponent, ForumsCategoriesComponent, ForumFormComponent, ForumsByCategoryComponent],
  imports: [
    CommonModule,
    ForumsRoutes,
    ReactiveFormsModule,
    FontAwesomeModule,

    // Standalone Components
    SidebarComponent,

    // Nebular
    NbCardModule,
    NbIconModule,
    NbButtonModule,
    NbInputModule,
  ],
})
export class ForumsModule {}
