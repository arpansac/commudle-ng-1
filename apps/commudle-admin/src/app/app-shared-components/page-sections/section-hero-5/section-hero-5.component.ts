import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { NbButtonModule } from '@commudle/theme';
import { IHero5Config } from './section-hero-5.config';

/** Tailwind color class applied to the second heading line when none is configured. */
const DEFAULT_LINE2_COLOR_CLASS = 'com-text-Caribbean-Green';

@Component({
  selector: 'commudle-section-hero-5',
  standalone: true,
  imports: [CommonModule, RouterModule, NbButtonModule],
  templateUrl: './section-hero-5.component.html',
  styleUrls: ['./section-hero-5.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHero5Component implements OnInit, OnDestroy {
  @Input({ required: true }) config!: IHero5Config;

  safeLine1: SafeHtml = '';
  safeLine2: SafeHtml = '';
  line2ColorClass = DEFAULT_LINE2_COLOR_CLASS;

  private destroy$ = new Subject<void>();

  constructor(private readonly sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.safeLine1 = this.sanitizer.bypassSecurityTrustHtml(this.config.headingLine1);
    this.safeLine2 = this.sanitizer.bypassSecurityTrustHtml(this.config.headingLine2);
    this.line2ColorClass = this.config.line2ColorClass ?? DEFAULT_LINE2_COLOR_CLASS;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
