import { Component, Input, ChangeDetectionStrategy, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionConfig } from '../section.types';
import { SECTION_COMPONENT_MAP } from '../section.registry';

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
