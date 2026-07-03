import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import confetti from 'canvas-confetti';

@Injectable({
  providedIn: 'root',
})
export class ConfettiService {
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Fire a celebratory confetti burst (fullscreen overlay).
   * Safe to call from anywhere — it no-ops during SSR.
   */
  celebrate(durationMs = 1800): void {
    if (!this.isBrowser) return;

    const colors = ['#3366ff', '#00d68f', '#ffaa00', '#ff3d71', '#ffffff'];
    const shapes: confetti.Shape[] = ['square', 'circle', 'star'];

    // Initial big burst from the center
    confetti({
      particleCount: 160,
      spread: 90,
      startVelocity: 45,
      origin: { y: 0.6 },
      colors,
      shapes,
      zIndex: 100000,
    });

    // Continuous side bursts for a livelier celebration
    const end = Date.now() + durationMs;
    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
        shapes,
        zIndex: 100000,
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
        shapes,
        zIndex: 100000,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    requestAnimationFrame(frame);
  }
}
