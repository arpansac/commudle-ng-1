import { Component, Input, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
import { CustomPageService } from 'apps/commudle-admin/src/app/services/custom-page.service';
import { ICustomPage } from 'apps/shared-models/custom-page.model';
import { Subscription } from 'rxjs';
import { faPlus, faArrowUpRightFromSquare, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { EDbModels } from '@commudle/shared-models';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';

@Component({
    selector: 'commudle-custom-page',
    templateUrl: './custom-page.component.html',
    styleUrls: ['./custom-page.component.scss'],
    standalone: false
})
export class CustomPageComponent implements OnInit, OnDestroy {
  @Input() parentId: number | string;
  @Input() parentType: EDbModels;
  @ViewChild('publishDialog') publishDialog: TemplateRef<any>;
  subscription: Subscription[] = [];
  pages: ICustomPage[];
  isLoading = true;
  icons = {
    faPlus,
    faArrowUpRightFromSquare,
    faEdit,
    faTrash,
  };
  staticAssets = staticAssets;

  constructor(
    private customPageService: CustomPageService,
    private toastrService: ToastrService,
    private dialogService: NbDialogService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getCustomPages();
  }

  ngOnDestroy() {
    this.subscription.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  getCustomPages() {
    this.isLoading = true;
    this.subscription.push(
      this.customPageService.getIndex(this.parentId, this.parentType).subscribe((data) => {
        this.pages = data;
        this.isLoading = false;
      }),
    );
  }

  onToggleClick(event: Event, id: number, index: number) {
    event.preventDefault();

    if (!this.pages[index].published) {
      this.openConfirmDialogBox(this.publishDialog, id, index);
    } else {
      this.togglePublished(id, index);
    }
  }

  confirmPublish(id: number, index: number) {
    this.togglePublished(id, index);
  }

  togglePublished(id, index) {
    this.customPageService.togglePublished(!this.pages[index].published, id).subscribe((data) => {
      this.pages[index] = data;
    });
  }

  openConfirmDialogBox(dialog: TemplateRef<any>, id, index) {
    this.dialogService.open(dialog, { context: { id, index } });
  }

  destroy(id, index) {
    this.customPageService.destroy(id).subscribe((data) => {
      if (data) {
        this.toastrService.successDialog('Deleted Successfully');
        this.pages.splice(index, 1);
      }
    });
  }

  redirectTo(slug) {
    let redirectUrl = '';
    if (this.parentType === EDbModels.KOMMUNITY) {
      redirectUrl = '/communities/' + this.parentId + '/p/' + slug;
    }
    if (this.parentType === EDbModels.COMMUNITY_GROUP) {
      redirectUrl = '/orgs/' + this.parentId + '/p/' + slug;
    }
    const url = this.router.serializeUrl(this.router.createUrlTree([redirectUrl]));
    window.open(url, '_blank');
  }
}
