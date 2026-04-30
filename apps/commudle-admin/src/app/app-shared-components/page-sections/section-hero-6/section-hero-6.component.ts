import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { NbButtonModule } from '@commudle/theme';
import { IHero6Config } from './section-hero-6.config';

@Component({
  selector: 'commudle-section-hero-6',
  standalone: true,
  imports: [CommonModule, RouterModule, NbButtonModule],
  templateUrl: './section-hero-6.component.html',
  styleUrls: ['./section-hero-6.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHero6Component implements OnInit, OnDestroy {
  @Input({ required: true }) config!: IHero6Config;

  safeHeading: SafeHtml = '';

  private destroy$ = new Subject<void>();

  constructor(private readonly sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.safeHeading = this.sanitizer.bypassSecurityTrustHtml(this.config.heading);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
