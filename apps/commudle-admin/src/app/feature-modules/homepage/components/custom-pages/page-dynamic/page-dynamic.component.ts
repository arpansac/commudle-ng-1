import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { SectionConfig } from 'apps/commudle-admin/src/app/app-shared-components/page-sections/section.types';
import { SectionPageLoaderService } from 'apps/commudle-admin/src/app/app-shared-components/page-sections/services/section-page-loader.service';
import { SectionRendererComponent } from 'apps/commudle-admin/src/app/app-shared-components/page-sections/section-renderer/section-renderer.component';

@Component({
  selector: 'app-page-dynamic',
  standalone: true,
  imports: [CommonModule, SectionRendererComponent],
  templateUrl: './page-dynamic.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDynamicComponent implements OnInit {
  sections: SectionConfig[] = [];

  constructor(private route: ActivatedRoute, private pageLoader: SectionPageLoaderService) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (!slug) return;

    const page = this.pageLoader.loadPage(slug);

    if (page?.sections) {
      this.sections = page.sections;
    }
  }
}
