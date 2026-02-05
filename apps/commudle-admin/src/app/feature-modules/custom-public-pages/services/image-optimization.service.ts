import { Injectable } from '@angular/core';

export interface ImageConfig {
  webp?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  fallback?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  alt: string;
  aspectRatio?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
}

export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
}

@Injectable({
  providedIn: 'root',
})
export class ImageOptimizationService {
  private readonly breakpoints: ResponsiveBreakpoints = {
    mobile: 768,
    tablet: 1024,
    desktop: 1440,
  };

  private readonly aspectRatios = {
    hero: '16:9',
    card: '4:3',
    avatar: '1:1',
    banner: '21:9',
    wide: '3:2',
  };

  private webpSupported?: boolean;

  constructor() {
    this.detectWebPSupport();
  }

  /**
   * Get the current viewport size category
   */
  getCurrentViewportSize(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;

    if (width <= this.breakpoints.mobile) {
      return 'mobile';
    } else if (width <= this.breakpoints.tablet) {
      return 'tablet';
    }

    return 'desktop';
  }

  /**
   * Get optimized image source for current viewport
   */
  getOptimizedImageSrc(config: ImageConfig): { src: string; srcset?: string } {
    const viewportSize = this.getCurrentViewportSize();
    const supportsWebP = this.isWebPSupported();

    // Choose format based on WebP support
    const sources = supportsWebP && config.webp ? config.webp : config.fallback;

    if (!sources) {
      return { src: '' };
    }

    // Get source for current viewport
    const src = sources[viewportSize] || sources.desktop || '';

    // Generate srcset for responsive images
    const srcset = this.generateSrcSet(sources);

    return { src, srcset };
  }

  /**
   * Generate srcset string for responsive images
   */
  private generateSrcSet(sources: { mobile?: string; tablet?: string; desktop?: string }): string {
    const srcsetParts: string[] = [];

    if (sources.mobile) {
      srcsetParts.push(`${sources.mobile} ${this.breakpoints.mobile}w`);
    }

    if (sources.tablet) {
      srcsetParts.push(`${sources.tablet} ${this.breakpoints.tablet}w`);
    }

    if (sources.desktop) {
      srcsetParts.push(`${sources.desktop} ${this.breakpoints.desktop}w`);
    }

    return srcsetParts.join(', ');
  }

  /**
   * Generate picture element HTML with WebP support
   */
  generatePictureElement(config: ImageConfig, className = ''): string {
    const { webp, fallback, alt, aspectRatio, loading = 'lazy', fetchPriority = 'auto' } = config;

    if (!fallback) {
      return '';
    }

    let pictureHtml = '<picture class="' + className + '">';

    // Add WebP sources if available
    if (webp) {
      if (webp.mobile) {
        pictureHtml += `<source media="(max-width: ${this.breakpoints.mobile}px)" srcset="${webp.mobile}" type="image/webp">`;
      }
      if (webp.tablet) {
        pictureHtml += `<source media="(max-width: ${this.breakpoints.tablet}px)" srcset="${webp.tablet}" type="image/webp">`;
      }
      if (webp.desktop) {
        pictureHtml += `<source srcset="${webp.desktop}" type="image/webp">`;
      }
    }

    // Add fallback sources
    if (fallback.mobile) {
      pictureHtml += `<source media="(max-width: ${this.breakpoints.mobile}px)" srcset="${fallback.mobile}">`;
    }
    if (fallback.tablet) {
      pictureHtml += `<source media="(max-width: ${this.breakpoints.tablet}px)" srcset="${fallback.tablet}">`;
    }

    // Add img element
    const imgSrc = fallback.desktop || fallback.tablet || fallback.mobile || '';
    const aspectRatioStyle = aspectRatio ? `style="aspect-ratio: ${aspectRatio}"` : '';
    const loadingAttr = loading === 'eager' ? 'loading="eager"' : 'loading="lazy"';
    const fetchPriorityAttr = fetchPriority !== 'auto' ? `fetchpriority="${fetchPriority}"` : '';

    pictureHtml += `<img src="${imgSrc}" alt="${alt}" ${aspectRatioStyle} ${loadingAttr} ${fetchPriorityAttr} class="responsive-image">`;
    pictureHtml += '</picture>';

    return pictureHtml;
  }

  /**
   * Check if WebP format is supported
   */
  isWebPSupported(): boolean {
    return this.webpSupported ?? false;
  }

  /**
   * Detect WebP support asynchronously
   */
  private detectWebPSupport(): void {
    if (typeof window === 'undefined') {
      this.webpSupported = false;
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    try {
      this.webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } catch {
      this.webpSupported = false;
    }
  }

  /**
   * Get aspect ratio by name
   */
  getAspectRatio(name: keyof typeof this.aspectRatios): string {
    return this.aspectRatios[name];
  }

  /**
   * Preload critical images
   */
  preloadCriticalImages(imageSources: string[]): void {
    imageSources.forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }

  /**
   * Create intersection observer for lazy loading
   */
  createLazyLoadObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options: IntersectionObserverInit = {},
  ): IntersectionObserver | null {
    if (!('IntersectionObserver' in window)) {
      return null;
    }

    const defaultOptions = {
      rootMargin: '50px',
      threshold: 0.1,
      ...options,
    };

    return new IntersectionObserver(callback, defaultOptions);
  }

  /**
   * Get image loading strategy based on position
   */
  getLoadingStrategy(isAboveFold: boolean): { loading: 'lazy' | 'eager'; fetchPriority: 'high' | 'low' | 'auto' } {
    if (isAboveFold) {
      return {
        loading: 'eager',
        fetchPriority: 'high',
      };
    }

    return {
      loading: 'lazy',
      fetchPriority: 'auto',
    };
  }

  /**
   * Calculate optimal image dimensions for viewport
   */
  getOptimalDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    aspectRatio?: string,
  ): { width: number; height: number } {
    if (aspectRatio) {
      const [ratioWidth, ratioHeight] = aspectRatio.split(':').map(Number);
      const calculatedHeight = (maxWidth * ratioHeight) / ratioWidth;

      return {
        width: maxWidth,
        height: Math.round(calculatedHeight),
      };
    }

    const scale = Math.min(maxWidth / originalWidth, 1);

    return {
      width: Math.round(originalWidth * scale),
      height: Math.round(originalHeight * scale),
    };
  }

  /**
   * Generate sizes attribute for responsive images
   */
  generateSizesAttribute(breakpoints?: { mobile?: string; tablet?: string; desktop?: string }): string {
    if (!breakpoints) {
      return '100vw';
    }

    const sizes: string[] = [];

    if (breakpoints.mobile) {
      sizes.push(`(max-width: ${this.breakpoints.mobile}px) ${breakpoints.mobile}`);
    }

    if (breakpoints.tablet) {
      sizes.push(`(max-width: ${this.breakpoints.tablet}px) ${breakpoints.tablet}`);
    }

    if (breakpoints.desktop) {
      sizes.push(breakpoints.desktop);
    } else {
      sizes.push('100vw');
    }

    return sizes.join(', ');
  }
}
