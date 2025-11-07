import { DOCUMENT } from '@angular/common';
import { ApplicationRef, Component, Inject, OnInit } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { IsBrowserService } from 'apps/shared-services/is-browser.service';
import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';
import { concat, interval } from 'rxjs';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-sw-update',
  templateUrl: './sw-update.component.html',
  styleUrls: ['./sw-update.component.scss'],
})
export class SwUpdateComponent implements OnInit {
  isBrowser: boolean;

  constructor(
    private updates: SwUpdate,
    private appRef: ApplicationRef,
    private toastLogService: LibToastLogService,
    private isBrowserService: IsBrowserService,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.isBrowser = this.isBrowserService.isBrowser();
  }

  ngOnInit() {
    if (this.isBrowser) {
      // Allow the app to stabilize first, before starting polling for updates with `interval()`.
      const appIsStable$ = this.appRef.isStable.pipe(first((isStable) => isStable === true));
      const everySixHours$ = interval(6 * 60 * 60 * 1000);
      const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

      everySixHoursOnceAppIsStable$.subscribe(async () => {
        try {
          const updateFound = await this.updates.checkForUpdate();
          console.log(updateFound ? 'A new version is available.' : 'Already on the latest version.');
        } catch (err) {
          console.error('Failed to check for updates:', err);
        }
      });

      this.updates.versionUpdates.subscribe((evt) => {
        switch (evt.type) {
          case 'VERSION_DETECTED':
            console.log(`Downloading new app version: ${evt.version.hash}`);
            this.toastLogService.notificationDialog(`Downloading new app version...`);
            break;
          case 'VERSION_READY':
            console.log(`Current app version: ${evt.currentVersion.hash}`);
            console.log(`New app version ready for use: ${evt.latestVersion.hash}`);
            // Prompt the user to update
            if ((evt as VersionReadyEvent)?.latestVersion?.appData?.critical) {
              this.document.location.reload();
            } else {
              if (confirm('New version available. Load New Version?')) {
                this.toastLogService.warningDialog('Updating App...!');
                this.document.location.reload();
              }
            }
            break;
          case 'NO_NEW_VERSION_DETECTED':
            console.log('No new version detected. App is up to date.');
            break;
          case 'VERSION_INSTALLATION_FAILED':
            console.error(`Failed to install app version '${evt.version.hash}': ${evt.error}`);
            this.toastLogService.errorDialog(`Failed to install new version. Please try again later.`);
            break;
        }
      });

      this.updates.unrecoverable.subscribe((event) => {
        this.toastLogService.errorDialog(
          'An error occurred that we cannot recover from:\n' + event.reason + '\n\nPlease reload the page.',
        );
        console.error('Unrecoverable state:', event.reason);
      });
    }
  }
}
