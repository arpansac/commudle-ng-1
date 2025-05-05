import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EditorModule } from '@commudle/editor';
import { InViewportDirective } from '@commudle/in-viewport';
import { InfiniteScrollModule } from '@commudle/infinite-scroll';
import {
  NbButtonModule,
  NbCardModule,
  NbContextMenuModule,
  NbIconModule,
  NbPopoverModule,
  NbTooltipModule,
} from '@commudle/theme';
import { DiscussionComponent } from './components/discussion/discussion.component';
import { MessageComponent } from './components/discussion/message/message.component';
import { VoteComponent } from './components/vote/vote.component';
import { ChannelDiscussionComponent } from './components/channel-discussion/channel-discussion.component';
import { CommunityChannelMessageComponent } from './components/channel-discussion/community-channel-message/community-channel-message.component';
import { CommunityForumMessageComponent } from './components/channel-discussion/community-forum-message/community-forum-message.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { FaqComponent } from './components/faq/faq.component';
import { FaqCardComponent } from './components/faq/faq-card/faq-card.component';
import { PublicFaqsComponent } from './components/public-faqs/public-faqs.component';
import { VotersComponent } from './components/vote/voters/voters.component';
import { UserProfileMiniCardComponent } from './components/user-profile/user-profile-mini-card/user-profile-mini-card.component';
import { UserPersonalConnectComponent } from './components/user-personal-connect/user-personal-connect.component';
import { InputComponent } from './components/input/input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CampaignAssetsDisplayComponent } from './components/campaign-assets-display/campaign-assets-display.component';
import { UserExpertTickComponent } from 'apps/commudle-admin/src/app/app-shared-components/user-expert-tick.component';

@NgModule({
  declarations: [
    DiscussionComponent,
    MessageComponent,
    VoteComponent,
    ChannelDiscussionComponent,
    CommunityChannelMessageComponent,
    CommunityForumMessageComponent,
    LoadingSpinnerComponent,
    FaqComponent,
    FaqCardComponent,
    PublicFaqsComponent,
    VotersComponent,
    UserProfileMiniCardComponent,
    InputComponent,
    CampaignAssetsDisplayComponent,
  ],
  imports: [
    CommonModule,
    InfiniteScrollModule,
    RouterModule,
    EditorModule,
    NbIconModule,
    NbTooltipModule,
    NbButtonModule,
    NbPopoverModule,
    NbCardModule,
    InViewportDirective,
    NbContextMenuModule,
    FontAwesomeModule,
    UserPersonalConnectComponent,
    FormsModule,
    ReactiveFormsModule,
    UserExpertTickComponent,
  ],
  exports: [
    DiscussionComponent,
    VoteComponent,
    ChannelDiscussionComponent,
    LoadingSpinnerComponent,
    FaqComponent,
    PublicFaqsComponent,
    InputComponent,
    CampaignAssetsDisplayComponent,
  ],
  providers: [InViewportDirective],
})
export class SharedComponentsModule {}
