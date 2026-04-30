import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

export interface SectionHero1Config {
  title: string;
  subtitle: string;
  ctaText?: string;
}

@Component({
  selector: 'app-section-hero-1',
  templateUrl: './section-hero-1.component.html',
  styleUrls: ['./section-hero-1.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHero1Component {
  @Input() config!: SectionHero1Config;
}
