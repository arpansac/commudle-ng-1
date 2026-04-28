import { Component, Input, ChangeDetectionStrategy, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionConfig } from 'apps/commudle-admin/src/app/feature-modules/homepage/components/page-sections/section.types';
import { SECTION_COMPONENT_MAP } from 'apps/commudle-admin/src/app/feature-modules/homepage/components/page-sections/section.registry';

@Component({
  selector: 'commudle-section-renderer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-renderer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionRendererComponent {
  @Input() section!: SectionConfig;

  get component(): Type<any> | null {
    return SECTION_COMPONENT_MAP[this.section.type] || null;
  }
}
