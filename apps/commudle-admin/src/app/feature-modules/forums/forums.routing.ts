import { Routes, RouterModule } from '@angular/router';
import { ForumsDashboardComponent } from './components/forums-dashboard/forums-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: ForumsDashboardComponent,
    children: [
      // {
      //   path: '',
      //   component:
      // },
    ],
  },
];

export const ForumsRoutes = RouterModule.forChild(routes);
