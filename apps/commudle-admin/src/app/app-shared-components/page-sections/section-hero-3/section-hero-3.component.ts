import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NbButtonModule } from '@commudle/theme';
import { IHero3Config } from './section-hero-3.config';
import { Subject } from 'rxjs';

/**
 * Hero section variant 3 — two-column layout with abstract gradient visual.
 *
 * Sample config:
 *
 * ```json
 * {
 *   "type": "commudle-section-hero-3",
 *   "config": {
 *     "heading": "Build thriving tech communities",
 *     "subtext": "Commudle gives organizers everything they need — events, talks, hackathons, and more — in one place.",
 *     "primaryCta": { "label": "Get started free", "routerLink": "/register" },
 *     "secondaryCta": { "label": "Explore features", "routerLink": "/features" },
 *     "stats": [
 *       { "value": "10+", "label": "Years of experience" },
 *       { "value": "1M+", "label": "Community members" },
 *       { "value": "10K+", "label": "Events hosted" }
 *     ]
 *   }
 * }
 * ```
 */
@Component({
  selector: 'commudle-section-hero-3',
  standalone: true,
  imports: [CommonModule, RouterModule, NbButtonModule],
  templateUrl: './section-hero-3.component.html',
  styleUrls: ['./section-hero-3.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHero3Component implements OnDestroy {
  @Input({ required: true }) config!: IHero3Config;

  private destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
