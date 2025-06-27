import { Component } from '@angular/core';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import { FooterService } from 'apps/commudle-admin/src/app/services/footer.service';
import { AwsS3Bucket, staticAssets } from 'apps/commudle-admin/src/assets/static-assets';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  staticAssets = staticAssets;
  faYoutube = faYoutube;
  awsS3Bucket = AwsS3Bucket;

  showFooter$: Observable<boolean> = this.footerService.footerStatus$;
  showMiniFooter$: Observable<boolean> = this.footerService.miniFooterStatus$;

  constructor(private footerService: FooterService) {}
}
