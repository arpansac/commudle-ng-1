import { CommunitiesService } from 'apps/commudle-admin/src/app/services/communities.service';
import { ICommunityChannel } from 'apps/shared-models/community-channel.model';
import { RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, Input, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { NbButtonModule, NbIconModule } from '@commudle/theme';
import { CommudleCardModule } from '@commudle/commudle-theme';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { SharedPipesModule } from 'apps/shared-pipes/pipes.module';
import { ICommunity } from 'apps/shared-models/community.model';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'commudle-channel-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CommudleCardModule,
    NbButtonModule,
    SharedComponentsModule,
    NbIconModule,
    SharedPipesModule,
  ],
  templateUrl: './channel-card.component.html',
  styleUrls: ['./channel-card.component.scss'],
})
export class ChannelCardComponent implements OnInit, OnDestroy {
  @Input() channel: ICommunityChannel;
  @Input() community: ICommunity;
  @Input() horizontalScroll = false;
  @Input() showLatestMessage = true;
  private showDescriptioninterval: Subscription;
  showDescription = true;

  constructor(private communitiesService: CommunitiesService, @Inject(PLATFORM_ID) private platformId: object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId) && this.showLatestMessage) {
      this.showDescriptioninterval = interval(8000).subscribe(() => {
        this.showDescription = !this.showDescription;
      });
    }
    this.getCommunity();
  }

  ngOnDestroy() {
    if (this.showDescriptioninterval) {
      this.showDescriptioninterval.unsubscribe();
    }
  }

  getCommunity() {
    this.communitiesService.getCommunityDetails(this.channel.kommunity_id).subscribe((data) => {
      this.community = data;
    });
  }
}
