import { Routes, RouterModule } from '@angular/router';
import { ForumsDashboardComponent } from './components/forums-dashboard/forums-dashboard.component';
import { ForumsCategoriesComponent } from './components/forums-categories/forums-categories.component';

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
        component: ForumsCategoriesComponent,
      },
    ],
  },
];

export const ForumsRoutes = RouterModule.forChild(routes);
