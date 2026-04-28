import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SectionFeatureGrid1Item {
  title: string;
  description: string;
}

export interface SectionFeatureGrid1Config {
  heading?: string;
  items: SectionFeatureGrid1Item[];
}

@Component({
  selector: 'commudle-section-feature-grid-1',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-feature-grid-1.component.html',
  styleUrls: ['./section-feature-grid-1.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionFeatureGrid1Component implements OnInit {
  @Input() config!: SectionFeatureGrid1Config;

  ngOnInit(): void {
    console.log('Feature Grid Config:', this.config);
  }
}
