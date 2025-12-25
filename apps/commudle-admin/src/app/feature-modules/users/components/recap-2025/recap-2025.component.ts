import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IUserRecapStats } from '@commudle/shared-models';
import { AppUsersService, SeoService, ToastrService } from '@commudle/shared-services';
import { faChevronLeft, faChevronRight, faShare } from '@fortawesome/free-solid-svg-icons';
import { FooterService } from 'apps/commudle-admin/src/app/services/footer.service';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';
import { NavigatorShareService } from 'apps/shared-services/navigator-share.service';
import * as confetti from 'canvas-confetti';
import { Clipboard } from '@angular/cdk/clipboard';
import { environment } from '@commudle/shared-environments';

@Component({
  selector: 'commudle-recap-2025',
  templateUrl: './recap-2025.component.html',
  styleUrls: ['./recap-2025.component.scss'],
})
export class Recap2025Component implements OnInit, OnDestroy {
  currentSlide = 0;
  slidesCount = 12;
  statsData: IUserRecapStats;
  staticAssets = staticAssets;
  private timeoutId: any;
  animationFrameId: number; // To track the requestAnimationFrame ID

  icons = {
    faChevronLeft,
    faChevronRight,
    faShare,
  };

  canvas = <HTMLCanvasElement>document.getElementById('confetti');
  thankYouCanvas = <HTMLCanvasElement>document.getElementById('thankyou-confetti');

  constructor(
    private userService: AppUsersService,
    private seoService: SeoService,
    private footerService: FooterService,
    private activatedRoute: ActivatedRoute,
    private navigatorShareService: NavigatorShareService,
    private libToastLogService: ToastrService,
    private clipboard: Clipboard,
  ) {}

  ngOnInit() {
    this.footerService.changeMiniFooterStatus(false);
    this.startConfetti();
    this.getUserService();
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopConfetti(); // Stop the animation when the component is destroyed
  }

  getUserService() {
    this.userService.getRecapSummary(this.activatedRoute.snapshot.params.username).subscribe((data) => {
      this.statsData = data;
      this.calculateSlidesCount();
      this.setMeta();
    });
  }

  private calculateSlidesCount() {
    // this.slidesCount = this.statsData?.is_community_leader ? 12 : 11;
  }

  nextSlide() {
    if (this.currentSlide < this.slidesCount - 1) {
      this.currentSlide++;
      if (this.currentSlide === this.slidesCount - 1) {
        this.thankYouConfetti();
      }
      this.startAutoSlide();
    } else {
      this.clearAutoSlide(); // Stop auto-sliding at the last slide
    }
  }

  prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.startAutoSlide();
    }
  }

  private startAutoSlide() {
    this.clearAutoSlide(); // Clear any existing timeout
    this.timeoutId = setTimeout(() => {
      this.nextSlide();
    }, 5000); // 5 seconds
  }

  private clearAutoSlide() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  setMeta() {
    this.seoService.setTags(
      this.statsData.name + '- Recap 2025',
      "Here's a community recap for " + this.statsData.name + '  for 2025',
      this.statsData.photo.url,
    );
  }

  startConfetti(): void {
    let skew = 1;

    const myConfetti = confetti.create(this.canvas, { resize: true });

    const frame = () => {
      skew = Math.max(0.8, skew - 0.001);

      myConfetti({
        particleCount: 1,
        startVelocity: 0,
        ticks: 100,
        origin: {
          x: Math.random(),
          y: Math.random() * skew - 0.2, // Adjust y position for skew
        },
        colors: ['#ffffff'],
        shapes: ['circle'],
        gravity: this.randomInRange(0.4, 0.6),
        scalar: this.randomInRange(0.4, 1),
        drift: this.randomInRange(-0.4, 0.4),
      });

      // Schedule the next frame
      this.animationFrameId = requestAnimationFrame(frame);
    };

    frame(); // Start the animation loop
  }

  stopConfetti(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId); // Stop the animation
    }
  }

  randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  thankYouConfetti() {
    confetti.create(this.thankYouCanvas, { resize: true })({
      shapes: ['square', 'circle', 'star'],
      particleCount: 1000,
      spread: 360,
      zIndex: 9999,
      disableForReducedMotion: true,
      ticks: 500,
    });
  }

  copyTextToClipboard(): void {
    const content = environment.app_url + '/users/' + this.statsData.username + '/recap-2025';
    if (!this.navigatorShareService.canShare()) {
      if (this.clipboard.copy(content)) {
        this.libToastLogService.successDialog('Copied the message successfully!');
        return;
      }
    }

    this.navigatorShareService
      .share({
        title: this.statsData.name + ' - Recap 2025',
        text: this.statsData.name + ' - Recap 2025',
        url: content,
      })
      .then(() => {
        this.libToastLogService.successDialog('Shared Successfully!');
      });
  }
  redirectToProfile() {
    const url = environment.app_url + '/users/' + this.statsData.username;
    window.open(url, '_blank');
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'ArrowRight') {
      this.nextSlide(); // Call nextSlide on Right Arrow key press
    } else if (event.key === 'ArrowLeft') {
      this.prevSlide(); // Call prevSlide on Left Arrow key press
    }
  }
}
