import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { NbButtonModule } from '@commudle/theme';
import gsap from 'gsap';
import { Hero4GradientTheme, IHero4Config, IHero4GradientOverride } from './section-hero-4.config';

/**
 * Gradient color theme presets.
 * Hex values map directly to tokens defined in tailwind.preset.js:
 *   #3366ff = primary-500
 *   #2aa5ff = Brilliant-Azure
 *   #6f22df = Blue-Violet
 *   #635bff = Blue-Lotus
 *   #ff3d71 = Infra-Red
 *   #ff8a00 = American-Orange
 *   #ff5c1e = Giants-Orange
 *   #00d68f = Caribbean-Green
 */
const GRADIENT_THEMES: Record<Hero4GradientTheme, IHero4GradientOverride> = {
  blue: { colorA: '#3366ff', colorB: '#2aa5ff', colorC: '#6f22df' },
  purple: { colorA: '#6f22df', colorB: '#635bff', colorC: '#ff3d71' },
  orange: { colorA: '#ff8a00', colorB: '#ff3d71', colorC: '#ff5c1e' },
  teal: { colorA: '#00d68f', colorB: '#2aa5ff', colorC: '#3366ff' },
  rose: { colorA: '#ff3d71', colorB: '#ff8a00', colorC: '#635bff' },
};

@Component({
  selector: 'commudle-section-hero-4',
  standalone: true,
  imports: [CommonModule, RouterModule, NbButtonModule],
  templateUrl: './section-hero-4.component.html',
  styleUrls: ['./section-hero-4.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHero4Component implements OnInit, AfterViewInit, OnDestroy {
  @Input({ required: true }) config!: IHero4Config;

  /** The animated gradient mesh — GSAP rotates this element in 3D. */
  @ViewChild('mesh') meshRef!: ElementRef<HTMLElement>;

  safeHeading: SafeHtml = '';

  private destroy$ = new Subject<void>();
  private gsapTimeline?: gsap.core.Timeline;

  constructor(private readonly sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.safeHeading = this.sanitizer.bypassSecurityTrustHtml(this.config.heading);
  }

  ngAfterViewInit(): void {
    this.applyGradientColors();
    this.initMeshAnimation();
  }

  ngOnDestroy(): void {
    this.gsapTimeline?.kill();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Resolves the active gradient theme (override → preset → default 'blue')
   * and writes the three color stops as CSS custom properties on the mesh
   * element. The SCSS ribbons consume --gc-a, --gc-b, --gc-c.
   *
   * setProperty() is intentional here — CSS custom properties can only be
   * set programmatically; this is the same pattern used in section-hero-2.
   */
  private applyGradientColors(): void {
    const colors: IHero4GradientOverride =
      this.config.gradientOverride ?? GRADIENT_THEMES[this.config.gradientTheme ?? 'blue'];

    const el = this.meshRef.nativeElement;
    el.style.setProperty('--gc-a', colors.colorA);
    el.style.setProperty('--gc-b', colors.colorB);
    el.style.setProperty('--gc-c', colors.colorC);
  }

  /**
   * Builds an infinitely looping GSAP 3D rotation timeline on the gradient
   * mesh. `yoyo: true` reverses on each repeat so the ribbons oscillate
   * naturally rather than snapping back.
   *
   * Rotation values are intentionally gentle — this is a background element
   * so the motion should read as ambient, not distracting.
   */
  private initMeshAnimation(): void {
    const mesh = this.meshRef.nativeElement;

    this.gsapTimeline = gsap.timeline({
      repeat: -1,
      yoyo: true,
      defaults: { ease: 'sine.inOut' },
    });

    this.gsapTimeline
      .to(mesh, { rotationX: 12, rotationY: -22, rotationZ: 4, duration: 7 })
      .to(mesh, { rotationX: -8, rotationY: 18, rotationZ: -3, duration: 8 })
      .to(mesh, { rotationX: 6, rotationY: -10, rotationZ: 2, duration: 6 });
  }
}
