import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'cdn-chapter-logo-generator',
    loadComponent: () =>
      import('./components/cdn-chapter-logo-generator/cdn-chapter-logo-generator.component').then(
        (m) => m.CdnChapterLogoGeneratorComponent,
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WidgetsRoutingModule {}
