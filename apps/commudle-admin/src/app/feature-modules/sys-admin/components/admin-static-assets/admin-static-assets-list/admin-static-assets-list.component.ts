import { Component, OnInit } from '@angular/core';
import { IStaticAsset } from 'apps/shared-models/assets.model';
import { AdminStaticAssetsService } from '../../../services/admin-static-assets.service';
import { Subscription } from 'rxjs';
import { NbDialogService } from '@commudle/theme';
import { ToastrService } from '@commudle/shared-services';

@Component({
  selector: 'app-admin-static-assets-list',
  templateUrl: './admin-static-assets-list.component.html',
  styleUrls: ['./admin-static-assets-list.component.scss'],
})
export class AdminStaticAssetsListComponent implements OnInit {
  constructor(
    private adminStaticAssetsService: AdminStaticAssetsService,
    private nbDialogService: NbDialogService,
    private toastrService: ToastrService,
  ) {}
  assets: IStaticAsset[] = [];
  filteredAssets: IStaticAsset[] = [];
  searchQuery = '';
  page = 1;
  count = 5;
  total = -1;
  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.getAsset();
  }

  getAsset(): void {
    if (this.assets.length !== this.total) {
      this.subscriptions.push(
        this.adminStaticAssetsService.getAssets(this.page, this.count).subscribe((value) => {
          this.assets = this.assets.concat(value.static_assets);
          this.filteredAssets = [...this.assets];
          this.page = +value.page;
          this.total = +value.total;
          this.page += 1;
        }),
      );
    }
  }

  filterAssets(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredAssets = [...this.assets];
      return;
    }
    this.filteredAssets = this.assets.filter(
      (asset) => asset.name.toLowerCase().includes(query) || asset.id.toString().includes(query),
    );
  }

  openCopyLinkDialog(dialogTemplate, url: string): void {
    this.nbDialogService.open(dialogTemplate, { context: { url } });
  }

  copyLink(url: string): void {
    navigator.clipboard.writeText(url).then(() => {
      this.toastrService.successDialog('Link copied to clipboard!');
    });
  }
}
