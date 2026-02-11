import { isPlatformBrowser } from '@angular/common';
import { Directive, Inject, InjectionToken, Input, Optional, PLATFORM_ID, TemplateRef, ViewContainerRef } from '@angular/core';

/**
 * Used by `BreakpointsDirective` during SSR to deterministically evaluate responsive branches.
 *
 * SSR cannot know the real viewport width, so we assume a width (defaults to desktop) to avoid
 * rendering multiple mutually-exclusive breakpoint branches in the server HTML.
 */
export const SSR_VIEWPORT_WIDTH = new InjectionToken<number>('SSR_VIEWPORT_WIDTH', {
  providedIn: 'root',
  factory: () => 1025,
});

@Directive({
    selector: '[appBreakpoints]',
    standalone: false
})
export class BreakpointsDirective {
  private hasView = false;

  private breakpoints = [
    {
      name: 'sm',
      value: 640,
    },
    {
      name: 'md',
      value: 768,
    },
    {
      name: 'lg',
      value: 1024,
    },
    {
      name: 'xl',
      value: 1280,
    },
    {
      name: '2xl',
      value: 1536,
    },
  ];

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef,
    @Inject(PLATFORM_ID) private platformId: object,
    @Optional() @Inject(SSR_VIEWPORT_WIDTH) private ssrViewportWidth?: number,
  ) {}

  @Input()
  set appBreakpoints(value: '<=sm' | '<=md' | '<=lg' | '<=xl' | '<=2xl' | '>sm' | '>md' | '>lg' | '>xl' | '>2xl') {
    const sign = value.charAt(0);
    const breakpoint = this.breakpoints.find((b) => {
      return b.name === value.substr(sign === '<' ? 2 : 1);
    });

    if (breakpoint) {
      const width = isPlatformBrowser(this.platformId) ? window.innerWidth : (this.ssrViewportWidth ?? 1025);
      const condition = sign === '<' ? width <= breakpoint.value : width > breakpoint.value;
      this.updateLayout(condition);
    }
  }

  updateLayout(condition: boolean) {
    if (condition && !this.hasView) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
      this.hasView = true;
      return;
    }

    if (!condition && this.hasView) {
      this.viewContainerRef.clear();
      this.hasView = false;
    }
  }
}
