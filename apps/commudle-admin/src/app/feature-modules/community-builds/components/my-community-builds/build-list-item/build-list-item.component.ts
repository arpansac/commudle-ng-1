import { Component, OnInit, Input, TemplateRef, ViewChild, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { StatsCommunityBuildsService } from 'apps/commudle-admin/src/app/services/stats/stats-community-builds.service';
import {
  EDbModels,
  EPublishStatus,
  EPublishStatusColors,
  ICommunityBuild,
  ICommunityBuildStats,
} from '@commudle/shared-models';
import { NbDialogRef, NbDialogService } from '@commudle/theme';

@Component({
  selector: 'commudle-build-list-item',
  templateUrl: './build-list-item.component.html',
  styleUrls: ['./build-list-item.component.scss'],
})
export class BuildListItemComponent implements OnInit {
  @ViewChild('confirmDeleteTemplate') confirmDeleteTemplate: TemplateRef<any>;

  @Input() cb: ICommunityBuild;
  @Output() deleteBuild = new EventEmitter();
  EPublishStatus = EPublishStatus;
  EPublishStatusColors = EPublishStatusColors;
  moment = moment;
  stats: ICommunityBuildStats;
  EDbModels = EDbModels;

  dialogRef: NbDialogRef<any>;
  constructor(
    private statsCommunityBuildsService: StatsCommunityBuildsService,
    private dialogService: NbDialogService,
  ) {}

  ngOnInit() {
    this.getStats();
  }

  openDeleteConfirmation(cBuild) {
    this.dialogRef = this.dialogService.open(this.confirmDeleteTemplate, {
      context: { cb: cBuild },
    });
  }

  destroyBuild(buildId) {
    this.deleteBuild.emit(buildId);
    this.dialogRef.close();
  }

  getStats() {
    this.statsCommunityBuildsService.userEngagement(this.cb.id).subscribe((data: ICommunityBuildStats) => {
      this.stats = data;
    });
  }
}
