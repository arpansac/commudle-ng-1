import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';

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
export class SectionFeatureGrid1Component implements OnDestroy {
  @Input() config!: SectionFeatureGrid1Config;

  private destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
