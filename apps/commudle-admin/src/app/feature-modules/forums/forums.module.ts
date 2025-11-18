import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForumsRoutes } from './forums.routing';
import { ForumsDashboardComponent } from './components/forums-dashboard/forums-dashboard.component';
import { NbButtonModule, NbCardModule, NbIconModule, NbInputModule } from '@commudle/theme';
import { ForumsCategoriesComponent } from './components/forums-categories/forums-categories.component';
import { ForumFormComponent } from './components/forum-form/forum-form.component';
import { ForumsByCategoryComponent } from './components/forums-by-category/forums-by-category.component';
import { ForumDiscussionComponent } from './components/forum-discussion/forum-discussion.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SidebarComponent } from 'apps/shared-components/sidebar/sidebar.component';
import { NewDiscussionFormComponent } from './components/new-discussion-form/new-discussion-form.component';

@NgModule({
  declarations: [
    ForumsDashboardComponent,
    ForumsCategoriesComponent,
    ForumFormComponent,
    ForumsByCategoryComponent,
    ForumDiscussionComponent,
    NewDiscussionFormComponent,
  ],
  imports: [
    CommonModule,
    ForumsRoutes,
    ReactiveFormsModule,
    FormsModule,
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
