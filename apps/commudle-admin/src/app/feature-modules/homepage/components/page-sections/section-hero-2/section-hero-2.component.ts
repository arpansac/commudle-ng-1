import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NbButtonModule } from '@commudle/theme';

export interface SectionHero2Config {
  /** Section heading — supports HTML markup */
  title: string;
  /** Supporting body copy — supports HTML markup */
  subtitle: string;
  /** CTA button label; button is hidden when omitted */
  ctaText?: string;
}

/**
 * Sample config:
 *
 * ```json
 * {
 *   "type": "commudle-section-hero-2",
 *   "config": {
 *     "title": "Build <strong>thriving</strong> tech communities",
 *     "subtitle": "Commudle gives organizers everything they need — events, talks, hackathons, and more — in one place.",
 *     "ctaText": "Get started for free"
 *   }
 * }
 * ```
 */

@Component({
  selector: 'commudle-section-hero-2',
  standalone: true,
  imports: [CommonModule, NbButtonModule],
  templateUrl: './section-hero-2.component.html',
  styleUrls: ['./section-hero-2.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHero2Component implements OnInit, OnDestroy {
  @Input() config!: SectionHero2Config;

  @ViewChild('visual') visualRef!: ElementRef<HTMLElement>;

  safeTitle: SafeHtml = '';
  safeSubtitle: SafeHtml = '';

  private destroy$ = new Subject<void>();

  constructor(private readonly sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.safeTitle = this.sanitizer.bypassSecurityTrustHtml(this.config.title);
    this.safeSubtitle = this.sanitizer.bypassSecurityTrustHtml(this.config.subtitle);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Tracks mouse position over the host section and applies a subtle
   * 3D perspective tilt to the orbital visual via CSS custom properties.
   * Non-critical: if the visual ref is not yet available the event is ignored.
   */
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.visualRef) return;
    const el = this.visualRef.nativeElement;
    const rect = el.getBoundingClientRect();
    const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    el.style.setProperty('--tilt-x', `${(-dy * 8).toFixed(2)}deg`);
    el.style.setProperty('--tilt-y', `${(dx * 8).toFixed(2)}deg`);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (!this.visualRef) return;
    const el = this.visualRef.nativeElement;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
  }
}
