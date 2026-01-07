import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NbButtonModule, NbCardModule, NbInputModule, NbSpinnerModule, NbAlertModule } from '@commudle/theme';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faDownload, faImage, faRedo } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';
import { SeoService } from 'apps/shared-services/seo.service';

interface LogoGeneratorConfig {
  backgroundImageUrl?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  textPosition?: 'bottom' | 'center' | 'top';
  maxTextLength?: number;
}

@Component({
  selector: 'commudle-cdn-chapter-logo-generator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NbButtonModule,
    NbCardModule,
    NbInputModule,
    NbSpinnerModule,
    NbAlertModule,
    FontAwesomeModule,
  ],
  templateUrl: './cdn-chapter-logo-generator.component.html',
  styleUrls: ['./cdn-chapter-logo-generator.component.scss'],
})
export class CdnChapterLogoGeneratorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('previewCanvas', { static: false }) previewCanvasRef!: ElementRef<HTMLCanvasElement>;

  // Icons
  faDownload = faDownload;
  faImage = faImage;
  faRedo = faRedo;

  // Component state
  cityName = '';
  isImageLoading = false;
  isDownloading = false;
  errorMessage = '';
  backgroundImage: HTMLImageElement | null = null;

  // Configuration
  config: LogoGeneratorConfig = {
    backgroundImageUrl: staticAssets.widgets.cdn_logo,
    textColor: 'white',
    fontSize: 24,
    fontFamily: 'inter, sans-serif',
    textPosition: 'bottom',
    maxTextLength: 50,
  };

  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef, private seoService: SeoService) {}

  ngOnInit(): void {
    this.setMeta();
    this.loadBackgroundImage();
  }

  private setMeta(): void {
    this.seoService.setTags(
      'CDN Chapter Logo Generator',
      'Generate your chapter logo for your CDN community. Add the chapter name and download it directly!',
      'https://commudle.com/assets/images/commudle-logo192.png',
    );
  }

  ngAfterViewInit(): void {
    // Ensure canvas is available and update preview if image is already loaded
    if (this.backgroundImage && this.previewCanvasRef) {
      this.updatePreview();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBackgroundImage(): void {
    if (!this.config.backgroundImageUrl) {
      this.errorMessage = 'Background image URL is not configured';
      return;
    }

    this.isImageLoading = true;
    this.errorMessage = '';

    // Use fetch to get image as blob to prevent canvas tainting
    this.fetchImageAsBlob();
  }

  private async fetchImageAsBlob(): Promise<void> {
    try {
      this.isImageLoading = true;

      // 1. Fetch from Rails with a cache buster
      const railsUrl =
        this.config.backgroundImageUrl +
        (this.config.backgroundImageUrl.includes('?') ? '&' : '?') +
        'cb=' +
        Date.now();

      // Use standard 'follow' but with a fresh URL
      const initialResponse = await fetch(railsUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
      });

      // 2. Extract the S3 URL from the response
      // If the browser followed the redirect, initialResponse.url is the S3 URL
      const s3Url = initialResponse.url;

      // 3. IMPORTANT: Add a second cache-buster to the S3 URL
      // to force a fresh handshake that ignores the 'null' origin cache
      const cleanS3Url = s3Url + (s3Url.includes('?') ? '&' : '?') + 's3_cb=' + Date.now();

      console.log('Fetching from S3 with fresh context:', cleanS3Url);

      // 4. Fetch the actual blob from S3
      const s3Response = await fetch(cleanS3Url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
      });

      if (!s3Response.ok) {
        throw new Error(`S3 Error: ${s3Response.status}`);
      }

      const blob = await s3Response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        this.backgroundImage = img;
        this.isImageLoading = false;
        URL.revokeObjectURL(objectUrl);
        setTimeout(() => this.updatePreview(), 0);
        this.cdr.detectChanges();
      };

      img.onerror = (err) => {
        console.error('Canvas Image decode failed', err);
        this.createFallbackImage();
      };

      img.src = objectUrl;
    } catch (error) {
      console.error('Final CORS attempt failed:', error);
      this.createFallbackImage();
    }
  }

  private createFallbackImage(): void {
    console.log('Creating fallback image...');

    // Create a canvas-based fallback image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      this.handleImageLoadFailure();
      return;
    }

    // Set canvas dimensions (standard logo size)
    canvas.width = 800;
    canvas.height = 400;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add Commudle branding
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CDN', canvas.width / 2, canvas.height / 2 - 30);

    ctx.font = '24px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('Commudle Developer Network', canvas.width / 2, canvas.height / 2 + 20);

    // Convert canvas to image
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const fallbackImg = new Image();

        fallbackImg.onload = () => {
          this.backgroundImage = fallbackImg;
          this.isImageLoading = false;
          this.errorMessage = 'Using fallback background (original image could not be loaded due to CORS restrictions)';
          // Use setTimeout to ensure canvas is available
          setTimeout(() => {
            this.updatePreview();
          }, 0);
          this.cdr.detectChanges();
          URL.revokeObjectURL(url);
        };

        fallbackImg.src = url;
      } else {
        this.handleImageLoadFailure();
      }
    }, 'image/png');
  }

  private handleImageLoadFailure(): void {
    this.isImageLoading = false;
    this.errorMessage = 'Failed to load background image. Please check your internet connection or try again later.';
    this.cdr.detectChanges();
  }

  retryImageLoad(): void {
    console.log('Retrying image load...');
    this.loadBackgroundImage();
  }

  onCityNameChange(): void {
    // Validate input length
    if (this.cityName.length > (this.config.maxTextLength || 50)) {
      this.cityName = this.cityName.substring(0, this.config.maxTextLength || 50);
    }

    this.updatePreview();
  }

  private updatePreview(): void {
    if (!this.backgroundImage || !this.previewCanvasRef) {
      return;
    }

    const canvas = this.previewCanvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    // Set canvas dimensions to match image
    canvas.width = this.backgroundImage.width;
    canvas.height = this.backgroundImage.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Always draw background image first
    ctx.drawImage(this.backgroundImage, 0, 0);

    // Draw text overlay if city name is provided
    if (this.cityName.trim()) {
      this.drawTextOverlay(ctx, canvas.width, canvas.height);
    }
  }

  private drawTextOverlay(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const text = this.cityName.trim();
    const fontSize = this.config.fontSize || 48;
    const fontFamily = this.config.fontFamily || 'Arial, sans-serif';
    const textColor = this.config.textColor || '#FFFFFF';

    // Set font properties
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Add text shadow for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Calculate text position
    const x = width / 2;
    let y: number;

    switch (this.config.textPosition) {
      case 'top':
        y = fontSize + 10;
        break;
      case 'center':
        y = height / 2;
        break;
      case 'bottom':
      default:
        y = height - fontSize - 110; // Increased margin from 20 to 40
        break;
    }

    // Draw text
    ctx.fillText(text, x, y);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  downloadLogo(): void {
    if (!this.backgroundImage || !this.cityName.trim()) {
      this.errorMessage = 'Please enter a city or college name';
      return;
    }

    this.isDownloading = true;
    this.errorMessage = '';

    try {
      // Use the preview canvas directly instead of creating a new one
      const previewCanvas = this.previewCanvasRef.nativeElement;

      // Convert to blob and download
      previewCanvas.toBlob((blob) => {
        if (!blob) {
          this.errorMessage = 'Failed to generate image';
          this.isDownloading = false;
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `chapter-logo-${this.cityName.toLowerCase().replace(/\s+/g, '-')}.png`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
        this.isDownloading = false;
        this.cdr.detectChanges();
      }, 'image/png');
    } catch (error) {
      this.errorMessage = 'Failed to download logo due to security restrictions';
      this.isDownloading = false;
      console.error('Download error:', error);
    }
  }

  get isFormValid(): boolean {
    return this.cityName.trim().length > 0 && !this.isImageLoading && this.backgroundImage !== null;
  }

  get previewText(): string {
    return this.cityName.trim() || 'Enter city or college name';
  }

  get downloadFileName(): string {
    if (!this.cityName.trim()) {
      return 'chapter-logo-your-name.png';
    }
    const sanitizedName = this.cityName.toLowerCase().replace(/\s+/g, '-');
    return `chapter-logo-${sanitizedName}.png`;
  }
}
