import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MentionDirective } from './directives/mention-directive/mention.directive';
import { SuggestionBoxComponent } from './components/suggestion-box/suggestion-box.component';
import { NbListModule } from '@commudle/theme';
import { EntityProfileComponent } from './components/entity-profile/entity-profile.component';
import { SharedPipesModule } from 'apps/shared-pipes/pipes.module';
import { UserExpertTickComponent } from 'apps/commudle-admin/src/app/app-shared-components/user-expert-tick.component';

@NgModule({
  declarations: [MentionDirective, SuggestionBoxComponent, EntityProfileComponent],

  imports: [
    CommonModule,
    SharedPipesModule,
    //Nebular
    NbListModule,
    UserExpertTickComponent,
  ],

  exports: [MentionDirective],
})
export class MentionModule {}
