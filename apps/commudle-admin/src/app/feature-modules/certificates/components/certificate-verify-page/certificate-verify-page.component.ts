import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommudleButtonModule, CommudleCardModule } from '@commudle/commudle-theme';
import { ICertificatePublicRecipient } from '@commudle/shared-models';
import { CertificateRecipientService } from '@commudle/shared-services';
import { faCircleCheck, faDownload, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subject, takeUntil } from 'rxjs';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { SharedPipesModule } from 'apps/shared-pipes/pipes.module';

@Component({
  selector: 'commudle-certificate-verify-page',
  standalone: true,
  imports: [
    CommonModule,
    CommudleCardModule,
    CommudleButtonModule,
    FontAwesomeModule,
    SharedComponentsModule,
    SharedPipesModule,
  ],
  templateUrl: './certificate-verify-page.component.html',
  styleUrls: ['./certificate-verify-page.component.scss'],
})
export class CertificateVerifyPageComponent implements OnInit, OnDestroy {
  recipient: ICertificatePublicRecipient | null = null;
  isLoading = true;
  notFound = false;
  icons = {
    faCircleCheck,
    faDownload,
    faUser,
  };

  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private certificateRecipientService: CertificateRecipientService) {}

  ngOnInit() {
    const uuid = this.route.snapshot.paramMap.get('uuid');
    this.certificateRecipientService
      .verifyCertificate(uuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (recipient) => {
          this.recipient = recipient;
          this.isLoading = false;
        },
        error: () => {
          this.notFound = true;
          this.isLoading = false;
        },
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
