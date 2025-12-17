import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[optimizedImage]',
  standalone: true,
})
export class OptimizedImageDirective implements OnInit, OnDestroy {
  @Input() webpSrc?: string;
  @Input() fallbackSrc?: string;
  @Input() lazyLoad = true;
  @Input() aspectRatio?: string;

  private intersectionObserver?: IntersectionObserver;
  private isLoaded = false;

  constructor(private el: ElementRef<HTMLImageElement>, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.setupImage();

    if (this.lazyLoad) {
      this.setupLazyLoading();
    } else {
      this.loadImage();
    }
  }

  ngOnDestroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  private setupImage(): void {
    const img = this.el.nativeElement;

    // Set aspect ratio if provided
    if (this.aspectRatio) {
      this.renderer.setStyle(img, 'aspect-ratio', this.aspectRatio);
    }

    // Add loading class
    this.renderer.addClass(img, 'optimized-image');

    if (this.lazyLoad) {
      this.renderer.addClass(img, 'lazy-loading');
    }
  }

  private setupLazyLoading(): void {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without Intersection Observer
      this.loadImage();
      return;
    }

    const options = {
      rootMargin: '50px',
      threshold: 0.1,
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.isLoaded) {
          this.loadImage();
          this.intersectionObserver?.unobserve(entry.target);
        }
      });
    }, options);

    this.intersectionObserver.observe(this.el.nativeElement);
  }

  private loadImage(): void {
    if (this.isLoaded) return;

    const img = this.el.nativeElement;
    const webpSrc = this.webpSrc || img.dataset['webpSrc'];
    const fallbackSrc = this.fallbackSrc || img.dataset['src'] || img.src;

    if (!webpSrc && !fallbackSrc) {
      console.warn('OptimizedImageDirective: No image sources provided');
      return;
    }

    // Check WebP support and load appropriate format
    if (webpSrc && this.supportsWebP()) {
      this.loadImageSrc(webpSrc, fallbackSrc);
    } else if (fallbackSrc) {
      this.loadImageSrc(fallbackSrc);
    }
  }

  private loadImageSrc(src: string, fallbackSrc?: string): void {
    const img = this.el.nativeElement;

    // Create a new image element to preload
    const preloadImg = new Image();

    preloadImg.onload = () => {
      img.src = src;
      this.onImageLoaded();
    };

    preloadImg.onerror = () => {
      if (fallbackSrc && src !== fallbackSrc) {
        // Try fallback format
        this.loadImageSrc(fallbackSrc);
      } else {
        this.onImageError();
      }
    };

    preloadImg.src = src;
  }

  private onImageLoaded(): void {
    this.isLoaded = true;
    const img = this.el.nativeElement;

    this.renderer.addClass(img, 'loaded');
    this.renderer.removeClass(img, 'lazy-loading');

    // Dispatch custom event for tracking
    const event = new CustomEvent('imageLoaded', {
      detail: { src: img.src, element: img },
    });
    img.dispatchEvent(event);
  }

  private onImageError(): void {
    const img = this.el.nativeElement;

    this.renderer.addClass(img, 'error');
    this.renderer.removeClass(img, 'lazy-loading');

    // Dispatch custom event for error tracking
    const event = new CustomEvent('imageError', {
      detail: { element: img },
    });
    img.dispatchEvent(event);
  }

  private supportsWebP(): boolean {
    // Check if WebP is supported
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
}
