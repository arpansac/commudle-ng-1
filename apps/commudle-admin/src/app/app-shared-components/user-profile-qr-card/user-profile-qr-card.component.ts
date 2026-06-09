import { Component, Input, OnChanges, SimpleChanges, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faShareNodes, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { IUser } from '@commudle/shared-models';
import { UserProfileComponent } from 'apps/commudle-admin/src/app/app-shared-components/user-profile/user-profile.component';
import { generate } from 'lean-qr';
import { environment } from '@commudle/shared-environments';

@Component({
  selector: 'commudle-user-profile-qr-card',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, UserProfileComponent],
  templateUrl: './user-profile-qr-card.component.html',
  styleUrls: ['./user-profile-qr-card.component.scss'],
})
export class UserProfileQrCardComponent implements OnChanges, AfterViewInit {
  @Input() user: IUser;
  @ViewChild('qrCanvas') qrCanvas: ElementRef<HTMLCanvasElement>;

  faShareNodes = faShareNodes;
  faQrcode = faQrcode;

  profileUrl = '';
  private viewInitialized = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.user && changes.user.currentValue) {
      this.profileUrl = `${environment.app_url}/users/${this.user.username}`;
      if (this.viewInitialized) {
        this.renderQRCode();
      }
    }
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    if (this.user) {
      this.renderQRCode();
    }
  }

  private renderQRCode(): void {
    setTimeout(() => {
      if (this.qrCanvas?.nativeElement) {
        const qrCode = generate(this.profileUrl);
        qrCode.toCanvas(this.qrCanvas.nativeElement);
        // Set display size via CSS, canvas already renders at native resolution
        const canvas = this.qrCanvas.nativeElement;
        canvas.style.width = '200px';
        canvas.style.height = '200px';
        canvas.style.imageRendering = 'pixelated';
      }
    }, 0);
  }

  copyProfileLink(): void {
    navigator.clipboard.writeText(this.profileUrl);
  }
}
