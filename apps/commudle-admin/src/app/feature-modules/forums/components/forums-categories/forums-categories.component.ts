import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { EDiscussionType, IChannelCategory } from '@commudle/shared-models';
import { ForumsStore } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
import { ForumFormComponent } from 'apps/commudle-admin/src/app/feature-modules/forums/components/forum-form/forum-form.component';
import { faPlus, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';

@Component({
  selector: 'commudle-forums-categories',
  templateUrl: './forums-categories.component.html',
  styleUrls: ['./forums-categories.component.scss'],
})
export class ForumsCategoriesComponent implements OnInit, OnDestroy {
  categories: IChannelCategory[] = [];
  readonly staticAssets = staticAssets;
  readonly icons = { faPlus, faArrowRight };

  private destroy$ = new Subject<void>();

  constructor(private readonly forumsStore: ForumsStore, private readonly dialogService: NbDialogService) {}

  ngOnInit(): void {
    this.forumsStore.categories$
      .pipe(takeUntil(this.destroy$))
      .subscribe((categories) => (this.categories = categories));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openDialogBox(): void {
    this.dialogService.open(ForumFormComponent, {
      context: {
        displayType: EDiscussionType.FORUM,
      },
    });
  }
}
