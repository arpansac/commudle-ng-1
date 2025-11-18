import { Routes, RouterModule } from '@angular/router';
import { ForumsDashboardComponent } from './components/forums-dashboard/forums-dashboard.component';
import { ForumsCategoriesComponent } from './components/forums-categories/forums-categories.component';
import { ForumsByCategoryComponent } from './components/forums-by-category/forums-by-category.component';
import { ForumDiscussionComponent } from './components/forum-discussion/forum-discussion.component';
import { ForumMessagesComponent } from './components/forum-messages/forum-messages.component';

const routes: Routes = [
  {
    path: '',
    component: ForumsDashboardComponent,
    children: [
      {
        path: '',
        component: ForumsCategoriesComponent,
      },
      {
        path: 'category/:slug',
        component: ForumsByCategoryComponent,
      },
      {
        path: 'category/:slug/:forumId/:discussionId',
        component: ForumDiscussionComponent,
      },
      {
        path: 'category/:slug/:forumId/:discussionId/messages/:userMessageId',
        component: ForumMessagesComponent,
      },
    ],
  },
];

export const ForumsRoutes = RouterModule.forChild(routes);
