import { Component, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NbDialogService } from '@commudle/theme';
import {
  faArrowRightFromBracket,
  faAudioDescription,
  faChevronRight,
  faFlask,
  faLightbulb,
  faLink,
  faNewspaper,
  faSuitcase,
} from '@fortawesome/free-solid-svg-icons';
import { FooterService } from 'apps/commudle-admin/src/app/services/footer.service';
import { ICurrentUser } from 'apps/shared-models/current_user.model';
import { LibAuthwatchService } from 'apps/shared-services/lib-authwatch.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'commudle-user-account-menu',
  templateUrl: './user-account-menu.component.html',
  styleUrls: ['./user-account-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UserAccountMenuComponent implements OnInit {
  currentUser: ICurrentUser;
  faChevronRight = faChevronRight;
  faLightbulb = faLightbulb;
  faFlask = faFlask;
  faSuitcase = faSuitcase;
  faNewspaper = faNewspaper;
  faAudioDescription = faAudioDescription;
  faArrowRightFromBracket = faArrowRightFromBracket;
  faLink = faLink;
  private destroy$ = new Subject<void>();

  constructor(
    private dialogService: NbDialogService,
    private router: Router,
    private authWatchService: LibAuthwatchService,
    private footerService: FooterService,
  ) {}

  ngOnInit() {
    this.authWatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data) {
        this.currentUser = data;
      }
    });
    this.footerService.changeMiniFooterStatus(false);
  }

  openConfirmDialogBox(dialog: TemplateRef<any>) {
    this.dialogService.open(dialog);
  }

  logout() {
    this.router.navigate(['/logout']);
  }
}
