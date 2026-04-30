import { Injectable } from '@angular/core';
import { DYNAMIC_PAGE_REGISTRY } from '../../../feature-modules/homepage/components/custom-pages/dynamic-page.registry';

@Injectable({ providedIn: 'root' })
export class SectionPageLoaderService {
  loadPage(slug: string) {
    return DYNAMIC_PAGE_REGISTRY[slug] || null;
  }
}
