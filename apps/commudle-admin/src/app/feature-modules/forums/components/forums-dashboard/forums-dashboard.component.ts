import { Component, OnInit } from '@angular/core';
import { EDbModels } from '@commudle/shared-models';
import { ForumService } from '@commudle/shared-services';
import { ForumsStore } from 'apps/commudle-admin/src/app/feature-modules/forums/store/forums.store';
import { SidebarService } from 'apps/shared-components/sidebar/service/sidebar.service';

interface ParentInfo {
  parent_id: string;
  parent_type: EDbModels;
}

@Component({
  selector: 'commudle-forums-dashboard',
  templateUrl: './forums-dashboard.component.html',
  styleUrls: ['./forums-dashboard.component.scss'],
})
export class ForumsDashboardComponent implements OnInit {
  parentInfo: ParentInfo | null = null;
  categories$ = this.forumStore.categories$;
  sidebarEventName = 'forumCategories';
  constructor(
    private forumStore: ForumsStore,
    private forumService: ForumService,
    public sidebarService: SidebarService,
  ) {}

  ngOnInit() {
    this.parentInfo = this.getParentFromUrl();
    this.sidebarService.setSidebarVisibility(this.sidebarEventName, false, true);

    if (this.parentInfo) {
      this.forumStore.loadForums(this.parentInfo.parent_id, this.parentInfo.parent_type);
      this.forumService
        .getCategories(this.parentInfo.parent_id, this.parentInfo.parent_type)
        .subscribe((categories) => {
          console.log('🚀 ~ ForumsDashboardComponent ~ ngOnInit ~ categories:', categories);
        });
    }
  }

  private getParentFromUrl(): ParentInfo | null {
    const url = window.location.pathname;

    // Match /admin/communities/{parent_id}/forums or /communities/{parent_id}/forums
    const communityMatch = url.match(/\/(admin\/)?communities\/([^/]+)\/forums/);
    if (communityMatch) {
      return {
        parent_id: communityMatch[2],
        parent_type: EDbModels.KOMMUNITY,
      };
    }

    // Match /admin/orgs/{parent_id}/forums or /orgs/{parent_id}/forums
    const orgMatch = url.match(/\/(admin\/)?orgs\/([^/]+)\/forums/);
    if (orgMatch) {
      return {
        parent_id: orgMatch[2],
        parent_type: EDbModels.COMMUNITY_GROUP,
      };
    }

    return null;
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebarVisibility(this.sidebarEventName);
  }
}
